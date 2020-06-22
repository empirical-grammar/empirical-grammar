#!/usr/bin/env bash

# Set environment-specific values
case $1 in
  prod)
    # ENSURE THAT WE'RE ON production FOR PRODUCTION DEPLOYS
    current_branch=`git rev-parse --abbrev-ref HEAD`
    if [ "$current_branch" != "production" ]
    then
      echo "You can not make a production deploy from a branch other than 'production'.  Don't forget to make sure you have the latest code pulled."
      exit 1
    fi
    S3_DEPLOY_BUCKET=s3://aws-website-quill-comprehension
    npm run build:prod
    ;;
  staging)
    S3_DEPLOY_BUCKET=s3://aws-website-quill-comprehension-staging
    npm run build:staging
    ;;
  *)
    echo "You must provide an environment argument of either 'staging' or 'prod'."
    exit 1
esac

# Upload build to S3 bucket
aws s3 sync ./dist ${S3_DEPLOY_BUCKET} --profile peter-aws
