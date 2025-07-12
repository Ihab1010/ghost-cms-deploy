import * as cdk from 'aws-cdk-lib';
import { NeoTechAssessmentStack } from '../lib/neo-tech-assessment-stack.js';

const app = new cdk.App();
new NeoTechAssessmentStack(app, 'NeoTechAssessmentStack');