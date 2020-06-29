#!/usr/bin/env bash
current_branch=`git rev-parse --abbrev-ref HEAD`
app_name="QuillGrammar"

# Set environment-specific values
case $1 in
  prod)
    # ENSURE THAT WE'RE ON production FOR PRODUCTION DEPLOYS
    if [ "$current_branch" != "production" ]
    then
      echo "You can not make a production deploy from a branch other than 'production'.  Don't forget to make sure you have the latest code pulled."
      exit 1
    fi
    S3_DEPLOY_BUCKET=s3://aws-website-quill-grammar
    npm run build:prod
    ;;
  staging)
    S3_DEPLOY_BUCKET=s3://aws-website-quill-grammar-staging
    npm run build:staging
    ;;
  *)
    echo "You must provide an environment argument of either 'staging' or 'prod'."
    exit 1
esac

# Upload build to S3 bucket
aws s3 sync ./dist ${S3_DEPLOY_BUCKET} --profile peter-aws

# Slack deploy finish
sh ../../scripts/post_slack_deploy.sh $app_name $1 $current_branch true
