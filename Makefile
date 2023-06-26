IMAGE_NAME=nordsaving-frontend
VERSION=0.0.1

build: 
	docker build -t $(IMAGE_NAME):$(VERSION) .