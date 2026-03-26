'use client';

import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

interface FormStepperProps {
  activeStep: number;
};

export default function FormStepper({ activeStep }: FormStepperProps) {
  return (
    <Stepper
      activeStep={activeStep}
      alternativeLabel
      sx={{
        '& .MuiStepIcon-root.Mui-active': {
          color: '#E87722',
        },
        '& .MuiStepIcon-root.Mui-completed': {
          color: '#E87722',
        },
      }}
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <Step key={index}>
          <StepLabel></StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};
