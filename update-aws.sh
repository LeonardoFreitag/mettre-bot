# send files
scp -o IdentityFile=/home/fabricio/dev/aws/neocompany.pem    /home/fabricio/dev/proj/neo-wa-api/*.json            ubuntu@wt.neocompany.com.br:/home/ubuntu/neo-wa-api/
scp -o IdentityFile=/home/fabricio/dev/aws/neocompany.pem    /home/fabricio/dev/proj/neo-wa-api/*.yml             ubuntu@wt.neocompany.com.br:/home/ubuntu/neo-wa-api/
scp -o IdentityFile=/home/fabricio/dev/aws/neocompany.pem    /home/fabricio/dev/proj/neo-wa-api/Dockerfile        ubuntu@wt.neocompany.com.br:/home/ubuntu/neo-wa-api/
scp -o IdentityFile=/home/fabricio/dev/aws/neocompany.pem -r /home/fabricio/dev/proj/neo-wa-api/src/*             ubuntu@wt.neocompany.com.br:/home/ubuntu/neo-wa-api/src/

# rebuild docker
ssh -i "/home/fabricio/dev/aws/neocompany.pem" ubuntu@wt.neocompany.com.br "cd /home/ubuntu/neo-wa-api; sudo docker-compose down; sudo docker-compose up -d --build"