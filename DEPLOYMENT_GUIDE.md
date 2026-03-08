# Jan-Sahayak Deployment Guide

## Prerequisites

### Required Tools
- AWS CLI (v2.x or higher)
- Terraform (v1.5 or higher)
- Python 3.11+
- Node.js 18+ and npm
- Docker (for local testing)
- Git

### AWS Account Setup
1. Create an AWS account or use existing one
2. Set up IAM user with administrator access
3. Configure AWS CLI with credentials:
   ```bash
   aws configure
   ```

### Required AWS Service Limits
Request limit increases for:
- Lambda concurrent executions: 3000
- API Gateway requests: 10,000 per second
- DynamoDB capacity units: Auto-scaling enabled
- S3 buckets: At least 5

## Deployment Steps

### Phase 1: Infrastructure Setup (Day 1-2)

#### 1.1 Initialize Terraform
```bash
cd infrastructure/
terraform init
```

#### 1.2 Create terraform.tfvars
```hcl
# terraform.tfvars
aws_region  = "ap-south-1"
environment = "prod"
project_name = "jan-sahayak"

# Add other variables as needed
```

#### 1.3 Plan and Apply Infrastructure
```bash
# Review the plan
terraform plan -out=tfplan

# Apply the infrastructure
terraform apply tfplan

# Save outputs
terraform output > outputs.txt
```

This will create:
- VPC with public and private subnets
- RDS PostgreSQL database
- DynamoDB tables
- S3 buckets
- Cognito User Pool
- IAM roles and policies
- KMS encryption keys

#### 1.4 Initialize Database Schema
```bash
# Get RDS endpoint from terraform output
DB_ENDPOINT=$(terraform output -raw rds_endpoint)

# Connect to database
psql -h $DB_ENDPOINT -U admin -d jansahayak

# Run schema migrations
psql -h $DB_ENDPOINT -U admin -d jansahayak -f ../database/schema.sql
```

### Phase 2: AI Services Configuration (Day 3-4)

#### 2.1 Amazon Transcribe Custom Language Models

```bash
# Create custom vocabulary for scheme names
aws transcribe create-vocabulary \
  --vocabulary-name jan-sahayak-schemes \
  --language-code hi-IN \
  --vocabulary-file-uri s3://jan-sahayak-config/transcribe/vocabulary.txt

# Create custom language model (optional, for better accuracy)
aws transcribe create-language-model \
  --language-code hi-IN \
  --base-model-name NarrowBand \
  --model-name jan-sahayak-hindi \
  --input-data-config S3Uri=s3://jan-sahayak-training/transcribe/,DataAccessRoleArn=arn:aws:iam::ACCOUNT:role/TranscribeRole
```

#### 2.2 Amazon Lex Bot Setup

```bash
# Import bot from JSON
aws lexv2-models create-bot-import \
  --bot-name jan-sahayak-bot \
  --bot-import-specification file://config/lex-bot-config.json

# Create bot alias
aws lexv2-models create-bot-alias \
  --bot-id BOT_ID \
  --bot-alias-name production \
  --bot-version 1
```

#### 2.3 Amazon Bedrock Model Access

```bash
# Enable Bedrock model access (must be done via console first)
# Then configure model access programmatically

aws bedrock get-foundation-model --model-identifier anthropic.claude-3-5-sonnet-20241022-v2:0
```

### Phase 3: Lambda Functions Deployment (Day 5-7)

#### 3.1 Build Lambda Packages

```bash
cd lambda/

# Voice Processor
cd voice-processor/
pip install -r requirements.txt -t package/
cd package/
zip -r ../voice-processor.zip .
cd ..
zip -g voice-processor.zip lambda_function.py

# Upload to S3
aws s3 cp voice-processor.zip s3://jan-sahayak-lambda-code/voice-processor.zip

# Create Lambda function
aws lambda create-function \
  --function-name jan-sahayak-voice-processor \
  --runtime python3.11 \
  --role arn:aws:iam::ACCOUNT:role/jan-sahayak-lambda-role \
  --handler lambda_function.lambda_handler \
  --code S3Bucket=jan-sahayak-lambda-code,S3Key=voice-processor.zip \
  --timeout 30 \
  --memory-size 1024 \
  --environment Variables="{
    USER_SESSIONS_TABLE=jan-sahayak-user-sessions-prod,
    USER_PROFILES_TABLE=jan-sahayak-user-profiles-prod,
    LEX_BOT_ID=YOUR_BOT_ID,
    LEX_BOT_ALIAS=production
  }"
```

Repeat for other Lambda functions:
- scheme-search
- eligibility-checker
- form-processor
- pdf-generator
- document-ocr

#### 3.2 Configure API Gateway Integration

```bash
# Create API Gateway HTTP API integration
aws apigatewayv2 create-integration \
  --api-id YOUR_API_ID \
  --integration-type AWS_PROXY \
  --integration-uri arn:aws:lambda:ap-south-1:ACCOUNT:function:jan-sahayak-voice-processor \
  --payload-format-version 2.0

# Create routes
aws apigatewayv2 create-route \
  --api-id YOUR_API_ID \
  --route-key "POST /voice/process" \
  --target integrations/INTEGRATION_ID
```

### Phase 4: Data Population (Day 8-10)

#### 4.1 Load Scheme Database

```bash
# Import scheme data from CSV/JSON
python scripts/import_schemes.py \
  --input data/schemes/central_schemes.csv \
  --db-host $DB_ENDPOINT \
  --db-name jansahayak

python scripts/import_schemes.py \
  --input data/schemes/state_schemes.csv \
  --db-host $DB_ENDPOINT \
  --db-name jansahayak
```

#### 4.2 Upload Form Templates

```bash
# Upload all form PDFs to S3
aws s3 sync data/forms/ s3://jan-sahayak-forms/templates/

# Process forms with Textract to create metadata
python scripts/process_form_templates.py \
  --bucket jan-sahayak-forms \
  --prefix templates/
```

#### 4.3 Create Form-to-Chat Mappings

```bash
# Generate conversational flows for each form
python scripts/generate_form_conversations.py \
  --db-host $DB_ENDPOINT \
  --db-name jansahayak \
  --language-codes hi,bn,te,ta,mr,gu,kn,ml,pa,or
```

### Phase 5: WhatsApp Integration (Day 11-12)

#### 5.1 Setup Twilio Account
1. Create Twilio account
2. Get WhatsApp Business API access
3. Configure webhook URL

#### 5.2 Deploy WhatsApp Lambda Handler

```bash
cd lambda/whatsapp-handler/
zip -r whatsapp-handler.zip .

aws lambda create-function \
  --function-name jan-sahayak-whatsapp-handler \
  --runtime python3.11 \
  --role arn:aws:iam::ACCOUNT:role/jan-sahayak-lambda-role \
  --handler lambda_function.lambda_handler \
  --code S3Bucket=jan-sahayak-lambda-code,S3Key=whatsapp-handler.zip \
  --environment Variables="{
    TWILIO_ACCOUNT_SID=YOUR_SID,
    TWILIO_AUTH_TOKEN=YOUR_TOKEN,
    API_GATEWAY_URL=YOUR_API_URL
  }"

# Create API Gateway trigger
aws apigatewayv2 create-route \
  --api-id YOUR_API_ID \
  --route-key "POST /webhooks/whatsapp" \
  --target integrations/WHATSAPP_INTEGRATION_ID
```

#### 5.3 Configure Twilio Webhook
In Twilio Console, set webhook URL to:
```
https://YOUR_API_URL/webhooks/whatsapp
```

### Phase 6: IVRS Setup (Day 13-14)

#### 6.1 Create Amazon Connect Instance

```bash
# Create instance (via console, then get instance ID)
aws connect create-instance \
  --identity-management-type CONNECT_MANAGED \
  --instance-alias jan-sahayak-ivrs

# Associate Lambda with Connect
aws connect associate-lambda-function \
  --instance-id YOUR_INSTANCE_ID \
  --function-arn arn:aws:lambda:ap-south-1:ACCOUNT:function:jan-sahayak-voice-processor
```

#### 6.2 Create Contact Flow
1. Import contact flow JSON
2. Configure IVR menu
3. Set up language selection
4. Connect to Lambda functions

#### 6.3 Get Toll-Free Number

```bash
# Claim phone number
aws connect claim-phone-number \
  --target-arn arn:aws:connect:ap-south-1:ACCOUNT:instance/INSTANCE_ID \
  --phone-number-country-code IN \
  --phone-number-type TOLL_FREE
```

### Phase 7: Mobile App Deployment (Day 15-20)

#### 7.1 Build React Native App

```bash
cd mobile-app/

# Install dependencies
npm install

# Configure AWS Amplify
amplify configure

# Build Android
cd android/
./gradlew assembleRelease

# Build iOS
cd ios/
pod install
xcodebuild -workspace JanSahayak.xcworkspace -scheme JanSahayak -configuration Release
```

#### 7.2 Configure App

Update `aws-exports.js`:
```javascript
const awsconfig = {
  Auth: {
    region: 'ap-south-1',
    userPoolId: 'YOUR_USER_POOL_ID',
    userPoolWebClientId: 'YOUR_CLIENT_ID'
  },
  API: {
    endpoints: [
      {
        name: 'JanSahayakAPI',
        endpoint: 'YOUR_API_URL'
      }
    ]
  }
};
```

#### 7.3 Release to Stores

**Android (Google Play):**
1. Create app in Google Play Console
2. Upload APK
3. Complete store listing
4. Submit for review

**iOS (App Store):**
1. Create app in App Store Connect
2. Upload build via Xcode
3. Complete metadata
4. Submit for review

### Phase 8: Testing & QA (Day 21-25)

#### 8.1 Automated Testing

```bash
# Run integration tests
cd tests/
pytest integration/ -v

# Run load tests
locust -f load_test.py --host=YOUR_API_URL
```

#### 8.2 User Acceptance Testing
- Create test user accounts
- Test all user journeys
- Verify scheme eligibility logic
- Test PDF generation
- Verify OCR accuracy

#### 8.3 Security Testing
```bash
# Run security scan
aws inspector2 create-findings-report \
  --report-format JSON \
  --filter-criteria ...
```

### Phase 9: Monitoring & Alerting (Day 26-27)

#### 9.1 CloudWatch Dashboards

```bash
# Create dashboard
aws cloudwatch put-dashboard \
  --dashboard-name jan-sahayak-prod \
  --dashboard-body file://config/cloudwatch-dashboard.json
```

#### 9.2 Configure Alarms

```bash
# API Gateway 5xx errors
aws cloudwatch put-metric-alarm \
  --alarm-name jan-sahayak-api-errors \
  --alarm-description "Alert on API errors" \
  --metric-name 5XXError \
  --namespace AWS/ApiGateway \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold

# Lambda errors
aws cloudwatch put-metric-alarm \
  --alarm-name jan-sahayak-lambda-errors \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold
```

#### 9.3 Set Up SNS for Alerts

```bash
# Create SNS topic
aws sns create-topic --name jan-sahayak-alerts

# Subscribe email
aws sns subscribe \
  --topic-arn arn:aws:sns:ap-south-1:ACCOUNT:jan-sahayak-alerts \
  --protocol email \
  --notification-endpoint ops@example.com
```

### Phase 10: Go Live (Day 28-30)

#### 10.1 Pre-Launch Checklist
- [ ] All infrastructure deployed
- [ ] Database schema migrated
- [ ] Schemes data loaded
- [ ] Lambda functions deployed and tested
- [ ] API Gateway configured
- [ ] WhatsApp integration working
- [ ] IVRS toll-free number active
- [ ] Mobile apps approved and published
- [ ] Monitoring and alerts configured
- [ ] Security review completed
- [ ] Backup and recovery tested
- [ ] Documentation completed

#### 10.2 Soft Launch
1. Enable for pilot districts (3-5 districts)
2. Monitor usage and errors closely
3. Collect user feedback
4. Fix critical issues

#### 10.3 Full Launch
1. Enable nationwide
2. Launch marketing campaign
3. Partner with CSCs (Common Service Centers)
4. Provide training materials

## Post-Deployment

### Daily Operations

#### Monitor Key Metrics
```bash
# Check API health
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name Count \
  --dimensions Name=ApiId,Value=YOUR_API_ID \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum

# Check Lambda invocations
aws lambda get-function \
  --function-name jan-sahayak-voice-processor \
  --query 'Configuration.LastUpdateStatus'
```

#### Review Logs
```bash
# CloudWatch Logs Insights queries
aws logs start-query \
  --log-group-name /aws/lambda/jan-sahayak-voice-processor \
  --start-time $(date -d '1 hour ago' +%s) \
  --end-time $(date +%s) \
  --query-string 'fields @timestamp, @message | filter @message like /ERROR/ | sort @timestamp desc | limit 20'
```

### Weekly Tasks
- Review cost and usage reports
- Analyze user engagement metrics
- Update scheme database
- Review and address user feedback
- Security patch updates

### Monthly Tasks
- Performance optimization review
- Capacity planning
- Update AI models with new data
- Generate business reports
- Conduct security audits

## Rollback Procedures

### Emergency Rollback

```bash
# Rollback Lambda function
aws lambda update-function-code \
  --function-name jan-sahayak-voice-processor \
  --s3-bucket jan-sahayak-lambda-code \
  --s3-key voice-processor-v1.0.0.zip

# Rollback API Gateway deployment
aws apigatewayv2 create-deployment \
  --api-id YOUR_API_ID \
  --stage-name prod \
  --description "Rollback to previous version"

# Rollback database (if needed)
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier jan-sahayak-db-prod \
  --target-db-instance-identifier jan-sahayak-db-rollback \
  --restore-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S)
```

## Troubleshooting

### Common Issues

#### Issue: High Lambda timeout errors
**Solution:**
1. Check DynamoDB/RDS connection pooling
2. Increase Lambda timeout
3. Optimize database queries
4. Enable Lambda Provisioned Concurrency

#### Issue: Transcribe accuracy low
**Solution:**
1. Update custom vocabulary
2. Train custom language model
3. Improve audio quality requirements
4. Filter background noise

#### Issue: High costs
**Solution:**
1. Enable CloudFront caching
2. Optimize Lambda memory allocation
3. Use ElastiCache for frequent data
4. Implement request throttling

## Support Contacts

- **AWS Support:** enterprise-support@aws.com
- **DevOps Team:** devops@jan-sahayak.gov.in
- **Security Team:** security@jan-sahayak.gov.in
- **Product Team:** product@jan-sahayak.gov.in

## Additional Resources

- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Amazon Transcribe Developer Guide](https://docs.aws.amazon.com/transcribe/)
- [Amazon Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)

---

**Last Updated:** February 2026  
**Version:** 1.0  
**Maintained By:** Jan-Sahayak DevOps Team
