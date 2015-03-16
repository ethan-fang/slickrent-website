export AWS_DEFAULT_REGION=us-west-1
#aws s3 sync ./webapp s3://slickrent-website --recursive
aws s3 sync ./webapp s3://slickrent.space --recursive
