import './StepWizard.css';
import { HiOutlineCheck } from 'react-icons/hi2';

/**
 * Reusable Step Wizard Stepper component.
 * 
 * @param {Object[]} steps - Array of { label: string }
 * @param {number} currentStep - Current active step (0-indexed)
 * @param {Function} onStepClick - Callback when clicking a step
 */
export default function StepWizard({ steps, currentStep, onStepClick }) {
  return (
    <div className="wizard-stepper">
      {steps.map((step, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', flex: index < steps.length - 1 ? 1 : 'none' }}>
          <div
            className={`wizard-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            onClick={() => onStepClick && onStepClick(index)}
          >
            <div className="wizard-step-number">
              {index < currentStep ? <HiOutlineCheck size={16} /> : index + 1}
            </div>
            <span className="wizard-step-label">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div className={`wizard-connector ${index < currentStep ? 'completed' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
}
