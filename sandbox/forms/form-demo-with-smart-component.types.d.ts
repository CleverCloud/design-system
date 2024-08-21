export interface FormDemoWithSmartComponentState {
  type: 'idle' | 'submitting';
  values?: {
    name: string;
    email: string;
  };
  errors?: {
    email: 'email-used';
  };
}
