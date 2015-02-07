#!/usr/bin/env bash
file_name=webapp_`date +%Y%m%d_%H%M%S`.tar.gz

tar -cvf $file_name webapp
scp  $file_name ec2_share_with_xin041619:$file_name
