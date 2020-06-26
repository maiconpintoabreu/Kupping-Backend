download-certs:
	scp -i /home/maicon/.ssh/gcp-3 k3s.maicondev.com:/etc/letsencrypt/live/kuppingbackend.maicondev.com/fullchain.pem certs/fullchain.pem
	scp -i /home/maicon/.ssh/gcp-3 k3s.maicondev.com:/etc/letsencrypt/live/kuppingbackend.maicondev.com/privkey.pem certs/privkey.pem
	gpg --batch --yes --pinentry-mode loopback --passphrase ${SECRET_KEY} --output secrets/privkey.pem.gpg --symmetric --cipher-algo AES256 certs/privkey.pem
	gpg --batch --yes --pinentry-mode loopback --passphrase ${SECRET_KEY} --output secrets/fullchain.pem.gpg --symmetric --cipher-algo AES256 certs/fullchain.pem
gpg-config:
	gpg --batch --yes --pinentry-mode loopback --passphrase ${SECRET_KEY} --output secrets/config.gpg --symmetric --cipher-algo AES256 ~/.kube/config