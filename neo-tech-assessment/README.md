
# Neo Technologies Assessment - Ghost CMS Deployment

This project delivers the **Neo Technologies DevOps Assessment** by deploying Ghost CMS on AWS using **AWS CDK**, with CI/CD handled by **Jenkins** and security scans powered by **Semgrep**. The architecture and practices strictly follow **AWS best practices** and keep within **free-tier limits**.

## 📦 Project Overview

- **Infrastructure as Code (IaC)**: AWS CDK (TypeScript)
- **CI/CD Pipeline**: Jenkins with stages for SAST (Semgrep), deployment, and Slack notifications.
- **Security**: Uses IAM roles, Security Groups, and Semgrep static analysis.
- **Ghost Deployment**: Fully automated setup using EC2 UserData with Nginx reverse proxy.

---

## 🛠 Architecture Design

### 1️⃣ AWS Resources
- **VPC**: Public & Private subnets with NAT Gateways (within free-tier limits).
- **EC2**: Amazon Linux 2023 instance (t3.micro) hosting Ghost CMS.
- **Security Groups**:
  - Allow inbound HTTP (port 80) and SSH (port 22) only.
  - All outbound traffic allowed for updates and package installations.
- **IAM Role**: Grants SSM access for secure management (no key-based SSH needed).

### 2️⃣ Application Stack
- **Node.js & Nginx**: Installed via UserData for serving Ghost CMS.
- **Ghost CMS**: Installed as a non-root user (`ec2-user`).
- **Nginx**: Acts as a reverse proxy to Ghost.

### 3️⃣ Security Measures
- Enforced **least privilege IAM** for EC2 (AmazonSSMManagedInstanceCore).
- Disabled direct `root` access for Ghost installation.
- Configured Nginx with secure headers.
- Semgrep SAST scan during CI.

---

## 🚀 CI/CD Pipeline (Jenkins)

The Jenkins pipeline performs:
1. **Checkout**: Retrieves code from the Git repository.
2. **Semgrep SAST**:
   - Installs Semgrep.
   - Runs static analysis using `semgrep/semgrep.yml` rules.
   - Posts results to Slack via webhook.
3. **CDK Deploy**:
   - Installs AWS CDK CLI.
   - Installs dependencies (`npm install`).
   - Deploys stack (`cdk deploy --require-approval never`).
4. **Notifications**:
   - Posts success or failure message to Slack.

---

## 📂 Project Structure

```
neo-tech-assessment/
├── cdk.json
├── package.json
├── README.md
├── bin/
│   └── neo-tech-assessment.js
├── lib/
│   └── neo-tech-assessment-stack.js
├── Jenkinsfile
├── semgrep/
│   └── semgrep.yml
└── local-test.sh
```

---

## ✅ Requirements Covered

| Requirement                       | Implementation                                                |
|------------------------------------|----------------------------------------------------------------|
| Deploy Ghost CMS on AWS           | EC2 instance via CDK, Ghost installed via UserData            |
| Infrastructure as Code            | AWS CDK (TypeScript)                                          |
| CI/CD with SAST                   | Jenkins pipeline + Semgrep SAST                               |
| Slack integration                 | Slack notifications via webhook                               |
| Secure configuration              | IAM Roles, Security Groups, Nginx with secure proxy headers   |
| Free-tier compliance              | t3.micro EC2, minimal resources                               |

---

## 📝 Deployment Instructions

### 1️⃣ Prerequisites
- AWS CLI configured with appropriate permissions
- Node.js & npm installed
- AWS CDK installed globally (`npm install -g aws-cdk`)
- Jenkins server setup (with credentials for AWS and Slack)

### 2️⃣ Deploy from Local (Manual)
```bash
# Install dependencies
npm install

# Bootstrap CDK (only first time)
cdk bootstrap

# Deploy the stack
cdk deploy --require-approval never
```

### 3️⃣ Run CI/CD Locally (Optional)
```bash
chmod +x local-test.sh
./local-test.sh
```

---

## 🔐 Security Considerations
- EC2 IAM Role only allows SSM, no SSH key pairs created.
- Security Group only exposes port 80 (HTTP) and 22 (SSH).
- Nginx reverse proxy configured with secure headers.

---

## 📣 Notes
- All resources are provisioned within AWS Free Tier limits.
- Reviewer can clone the repository, set up Jenkins, and run the pipeline without modification.
- Semgrep results are posted to Slack for visibility.

---
