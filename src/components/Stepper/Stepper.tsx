import CheckIcon from "@mui/icons-material/Check";
import Step from "@mui/material/Step";
import StepConnector from "@mui/material/StepConnector";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import type { StepIconProps } from "@mui/material/StepIcon";

import styles from "./Stepper.module.scss";

type BookingStepperProps = {
  steps: string[];
  activeStep: number;
  className?: string;
};

type BookingStepIconProps = StepIconProps & {
  isLastStep: boolean;
};

function BookingStepIcon(props: BookingStepIconProps) {
  const { active, completed, className, isLastStep } = props;

  const iconClassName = [
    styles.stepIconRoot,
    active ? styles.active : "",
    active && isLastStep ? styles.activeLastStep : "",
    completed ? styles.completed : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={iconClassName}>
    {active || completed ? <CheckIcon /> : null}
    </div>
  );
}

const BookingStepper = ({
  steps,
  activeStep,
  className,
}: BookingStepperProps) => {
  return (
    <div className={[styles.stepperWrapper, className ?? ""].filter(Boolean).join(" ")}>
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        connector={
          <StepConnector
            classes={{
              alternativeLabel: styles.connectorAlternativeLabel,
              line: styles.connectorLine,
              active: styles.connectorActive,
              completed: styles.connectorCompleted,
            }}
          />
        }
        className={styles.styledStepper}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel
              StepIconComponent={(props) => (
                <BookingStepIcon
                  {...props}
                  isLastStep={Number(props.icon) === steps.length}
                />
              )}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </div>
  );
};

export default BookingStepper;
