#!/usr/bin/env bash

# Set environment-specific values
case $1 in
  prod)
    # ENSURE THAT WE'RE ON MASTER FOR PRODUCTION DEPLOYS
    current_branch=`git rev-parse --abbrev-ref HEAD`
    if [ "$current_branch" != "master" ]
    then
      echo "You can not make a production deploy from a branch other than 'master'.  Don't forget to make sure you have the latest code pulled."
      exit 1
    fi
    S3_DEPLOY_BUCKET=s3://aws-website-quillconnect-6sy4b
    # Execute a new build
    npm run build:prod
    ;;
  staging)
    S3_DEPLOY_BUCKET=s3://aws-website-quill-connect-staging
    # Execute a new build
    npm run build:staging
    ;;
  *)
    echo "You must provide an environment argument of either 'staging' or 'prod'."
    exit 1
esac

# Upload build to S3 bucket
aws s3 sync ./dist ${S3_DEPLOY_BUCKET} --profile peter-aws

# Add slack message
case $1 in
  prod)
    export SLACK_API_TOKEN=$(heroku config:get SLACK_API_TOKEN --app empirical-grammar)
    export PROJECT_NAME="QuillConnect"
    python3 ../post_slack_message.py
    ;;
esac