#!/bin/bash
docker run -it -v /usr/src/mustang/release-build/:/mustang/ --user 1000 mustang-build-linux /bin/bash /mustang/e2/docker/linux/build.sh
