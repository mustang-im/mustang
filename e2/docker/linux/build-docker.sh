#!/bin/bash
# ADA CASA https://docs.fluidattacks.com/criteria/vulnerabilities/380 wants a digest for the docker container image, but that's not possible here.
# We're not currently using this build path anyways, so just commenting it out
echo Disabled
exit 1

#docker run -it -v /usr/src/mustang/release-build/:/mustang/ --user 1000 mustang-build-linux /bin/bash /mustang/e2/docker/linux/build.sh
