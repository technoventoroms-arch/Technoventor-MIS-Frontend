#!/usr/bin/env bash
# Keep :latest plus the newest N git-SHA tags on Docker Hub; delete older SHA tags.
# Usage: prune-dockerhub-tags.sh <namespace> <repo> <keep_count> <hub_username> <hub_token>
set -euo pipefail

NAMESPACE="${1:?namespace}"
REPO="${2:?repo name}"
KEEP="${3:-10}"
HUB_USER="${4:?docker hub username}"
HUB_TOKEN="${5:?docker hub token}"

auth=$(printf '%s:%s' "$HUB_USER" "$HUB_TOKEN" | base64 | tr -d '\n')
api="https://hub.docker.com/v2/repositories/${NAMESPACE}/${REPO}/tags?page_size=100&ordering=-last_updated"

tags=()
while [ -n "$api" ]; do
  resp=$(curl -sf -H "Authorization: Basic ${auth}" "$api")
  while IFS= read -r name; do
    [ -n "$name" ] && tags+=("$name")
  done < <(echo "$resp" | python3 -c "import json,sys; d=json.load(sys.stdin); print('\n'.join(r['name'] for r in d.get('results',[])))")
  api=$(echo "$resp" | python3 -c "import json,sys; print(json.load(sys.stdin).get('next') or '')")
done

sha_tags=()
for t in "${tags[@]}"; do
  if [[ "$t" =~ ^[a-f0-9]{40}$ ]]; then
    sha_tags+=("$t")
  fi
done

to_delete=()
if [ "${#sha_tags[@]}" -gt "$KEEP" ]; then
  for ((i=KEEP; i<${#sha_tags[@]}; i++)); do
    to_delete+=("${sha_tags[$i]}")
  done
fi

if [ "${#to_delete[@]}" -eq 0 ]; then
  echo "Docker Hub ${NAMESPACE}/${REPO}: nothing to prune (${#sha_tags[@]} SHA tags, keep ${KEEP})"
  exit 0
fi

echo "Docker Hub ${NAMESPACE}/${REPO}: deleting ${#to_delete[@]} old SHA tag(s), keeping latest + ${KEEP} newest SHAs"
for tag in "${to_delete[@]}"; do
  code=$(curl -sf -o /dev/null -w '%{http_code}' -X DELETE \
    -H "Authorization: Basic ${auth}" \
    "https://hub.docker.com/v2/repositories/${NAMESPACE}/${REPO}/tags/${tag}/" || echo "000")
  echo "  deleted :${tag} (HTTP ${code})"
done
