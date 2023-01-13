# syntax=docker/dockerfile:1.4

# $ docker image build ubuntu+systemd.Dockerfile --tag "image-name" # --no-cache

# $ docker container run --rm -it \
# 	--privileged \
# 	--tmpfs //tmp --tmpfs //run --tmpfs //run/lock \
# 	--publish 80:80 \
# 	image-name:latest

FROM ubuntu:20.04

ENV container=docker

RUN apt-get update > /dev/null \
	# Node.js
	&& wget -qO- https://deb.nodesource.com/setup_18.x | sh \
	# Common
	&& apt-get install -y ca-certificates curl expect gnupg iproute2 lsb-release node.js sudo systemd systemd-sysv uidmap \
	# Update
	&& apt-get update > /dev/null \
	# Create docker group
	&& groupadd --gid 1000 docker \
	# Create a user
	&& useradd --uid 1000 --gid 1000 -m user \
	&& usermod -aG docker user \
	# Add sudo support
	&& echo user ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/user \
	&& chmod 0440 /etc/sudoers.d/user \
	# Trim systemd
	&& rm -rf /etc/systemd/system/*.wants/* \
		/lib/systemd/system/local-fs.target.wants/* \
		/lib/systemd/system/multi-user.target.wants/* \
		/lib/systemd/system/sockets.target.wants/*initctl* \
		/lib/systemd/system/sockets.target.wants/*udev* \
		/lib/systemd/system/sysinit.target.wants/systemd-tmpfiles-setup* \
		/lib/systemd/system/systemd-update-utmp*

#RUN echo "expect <<-EOF" >> /home/user/.profile \
#	&& sed "s/^\(send.*\)\"$/\1\\\r\"/g" <<-EOF >> /home/user/.profile && echo "EOF" >> /home/user/.profile
#		set timeout -1
#
#		spawn /path/to/script.sh
#
#		expect -exact "Question? \[y/N\]"
#		send -- "y"
#
#		expect eof
#	EOF

#RUN echo "sudo journalctl --follow --unit some.service" >> /home/user/.profile

COPY <<-EOF /etc/systemd/system/startup.service
		[Unit]
		ConditionPathExists=!/path/to/config.yml
		Description=startup.service

		[Service]
		ExecStart=/bin/bash --login
		Type=idle
		User=user
		StandardInput=tty-force
		StandardOutput=inherit
		StandardError=inherit

		[Install]
		WantedBy=multi-user.target
	EOF

RUN systemctl enable /etc/systemd/system/startup.service

VOLUME ["/run", "/run/lock", "/tmp"]

STOPSIGNAL SIGRTMIN+3

ENTRYPOINT ["/lib/systemd/systemd"]
