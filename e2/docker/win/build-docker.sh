#!/bin/bash
docker run -it -v /usr/src/mustang/release-build/:/mustang/ --user 1000 mustang-build-win /bin/bash /mustang/e2/docker/win/build.sh
