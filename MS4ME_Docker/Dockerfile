FROM ubuntu:18.04 as builder

RUN apt update && apt -y install wget unzip
RUN wget http://www.ms4systems.com/files/MS4ME_linux_ubuntu_64.zip
RUN unzip MS4ME_linux_ubuntu_64.zip
RUN cd MS4ME
RUN ls

FROM ubuntu:18.04 as runner
RUN apt update && apt -y install firefox libgtk2.0-0
COPY --from=builder MS4ME ./MS4ME
WORKDIR $PWD/MS4ME
RUN chmod +x ./*
RUN chmod +x jre/bin/*

CMD ["./MS4ME"]
