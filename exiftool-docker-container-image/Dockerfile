# docker build -t davidanson/exiftool:v12.62 -f Dockerfile .

# docker buildx build --platform linux/arm64,linux/amd64 -t davidanson/exiftool:v12.62 -f Dockerfile --push .

FROM alpine:latest
RUN apk add perl
WORKDIR /download
ADD https://exiftool.org/Image-ExifTool-12.62.tar.gz .
WORKDIR /extract
RUN gzip -dc /download/Image-ExifTool-12.62.tar.gz | tar -xf -
WORKDIR /workdir
ENTRYPOINT ["/extract/Image-ExifTool-12.62/exiftool"]

# docker run --rm --volume $PWD:/workdir davidanson/exiftool:v12.62 -ver
