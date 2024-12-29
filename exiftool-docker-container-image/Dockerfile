# https://exiftool.org
# https://hub.docker.com/r/davidanson/exiftool
# docker build -t davidanson/exiftool:v13.10 -f Dockerfile .
# docker run --rm --volume $PWD:/workdir davidanson/exiftool:v13.10 -ver
# docker buildx build --platform linux/arm64,linux/amd64 -t davidanson/exiftool:v13.10 -f Dockerfile --push .

FROM alpine:latest
RUN apk add perl
WORKDIR /download
ADD https://exiftool.org/Image-ExifTool-13.10.tar.gz .
WORKDIR /extract
RUN gzip -dc /download/Image-ExifTool-13.10.tar.gz | tar -xf -
WORKDIR /workdir
ENTRYPOINT ["/extract/Image-ExifTool-13.10/exiftool"]
