#!/bin/bash
docker run -it -v /usr/src/mustang/release-build/:/mustang/ mustang-build-linux /bin/bash /mustang/e2/docker/linux/build.sh
