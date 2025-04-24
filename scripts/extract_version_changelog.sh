#!/usr/bin/bash

set -euo pipefail

# cd to root project dir
cd "$(dirname "${BASH_SOURCE[0]}")/.."

#nice: VERSION_NUMBER as script input
# extracts the current version's changeset,
# includes its heading (e.g.: "## 2.0.0 - 2022-07-27")
# and the next heading (previous version)
sed -e "/^## $VERSION_NUMBER/,/^## / ! d" CHANGELOG.md > /tmp/body-1.md

# drop the leading and trailing headings & the empty lines below/above
tail --lines=+3 /tmp/body-1.md | head --lines=-2 > /tmp/body-2.md

# upgrade all headings by one level
sed 's/^#//g' /tmp/body-2.md > /tmp/body-3.md

cat /tmp/body-3.md
