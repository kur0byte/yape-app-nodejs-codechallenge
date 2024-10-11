#!/bin/zsh

financialSystemDir="$(dirname "$0")/financial-system"
dockerFiles=($(find "$financialSystemDir" -name '*.Dockerfile'))

echo "Found Dockerfiles:"
for filePath in "${dockerFiles[@]}"; do
  echo "$filePath"
done

docker="docker"
dockerTag="latest"

for filePath in "${dockerFiles[@]}"; do
  projectDir="$(dirname "$filePath")"
  serviceName="$(basename "$projectDir")"
  dockerHubRepo="docker.io/kur0dev/$serviceName"

  echo "Building Docker image for $serviceName"
  echo "$docker build -t $dockerHubRepo:$dockerTag -f $filePath $projectDir"

  $docker build -t "$dockerHubRepo:$dockerTag" -f "$filePath" "$projectDir"
  if [[ $? -ne 0 ]]; then
    echo "Failed to build Docker image for $serviceName"
    continue
  fi
  echo "Successfully built Docker image for $serviceName"

  echo "Pushing Docker image for $serviceName"
  echo "$docker push $dockerHubRepo:$dockerTag"

  $docker push "$dockerHubRepo:$dockerTag"
  if [[ $? -ne 0 ]]; then
    echo "Failed to push Docker image for $serviceName"
    continue
  fi
  echo "Successfully pushed Docker image for $serviceName"
done