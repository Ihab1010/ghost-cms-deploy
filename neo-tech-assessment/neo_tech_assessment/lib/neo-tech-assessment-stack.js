import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';

export class NeoTechAssessmentStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'NeoTechVPC', {
      maxAzs: 2
    });

    const sg = new ec2.SecurityGroup(this, 'GhostSG', {
      vpc,
      description: 'Allow HTTP and SSH',
      allowAllOutbound: true
    });
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH');
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP');

    const role = new iam.Role(this, 'GhostRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com')
    });
    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));

    const instance = new ec2.Instance(this, 'GhostInstance', {
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      associatePublicIpAddress: true,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      securityGroup: sg,
      role
    });

    instance.userData.addCommands(
      '#!/bin/bash',
      'exec > >(tee /var/log/ghost-setup.log|logger -t user-data -s 2>/dev/console) 2>&1',
      'echo "==> Updating system"',
      'dnf update -y',
      'echo "==> Installing Node.js and Nginx"',
      'dnf install -y nodejs nginx',
      'echo "==> Installing Ghost CLI globally"',
      'npm install ghost-cli@latest -g',
      'echo "==> Preparing Ghost directory"',
      'mkdir -p /var/www/ghost',
      'chown ec2-user:ec2-user /var/www/ghost',
      'chmod 775 /var/www/ghost',
      'echo "==> Installing Ghost as ec2-user in /var/www/ghost"',
      'sudo -u ec2-user -H bash -c "cd /var/www/ghost && ghost install --no-prompt --db sqlite3 --no-setup-nginx --no-setup-systemd --process local --url http://0.0.0.0"',
      'echo "==> Configuring Nginx reverse proxy"',
      'cat > /etc/nginx/nginx.conf <<EOF',
      'user nginx;',
      'worker_processes auto;',
      'error_log /var/log/nginx/error.log;',
      'pid /run/nginx.pid;',
      '',
      'events {',
      '    worker_connections 1024;',
      '}',
      '',
      'http {',
      '    include       /etc/nginx/mime.types;',
      '    default_type  application/octet-stream;',
      '    sendfile        on;',
      '    keepalive_timeout  65;',
      '',
      '    server {',
      '        listen 80;',
      '        server_name _;',
      '',
      '        location / {',
      '            proxy_pass http://127.0.0.1:2368;',
      '            proxy_set_header Host $$host;',
      '            proxy_set_header X-Real-IP $$remote_addr;',
      '            proxy_set_header X-Forwarded-For $$proxy_add_x_forwarded_for;',
      '            proxy_set_header X-Forwarded-Proto $$scheme;',
      '        }',
      '    }',
      '}',
      'EOF',
      'echo "==> Enabling and starting Nginx"',
      'systemctl enable nginx',
      'systemctl start nginx'
    );

    new cdk.CfnOutput(this, 'PublicIP', {
      value: instance.instancePublicIp,
      description: 'Public IP of Ghost CMS'
    });
  }
}
