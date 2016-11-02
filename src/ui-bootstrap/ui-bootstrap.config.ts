import { ConfigOption } from '../core/services/formly.config';
import {
  FormlyFieldInput,
  FormlyFieldCheckbox,
  FormlyFieldRadio,
  FormlyFieldSelect,
  FormlyFieldTextArea,
  FormlyFieldMultiCheckbox,
} from './types/types';
import {
  FormlyWrapperLabel,
  FormlyWrapperDescription,
  FormlyWrapperValidationMessages,
  FormlyWrapperFieldset,
} from './wrappers/wrappers';

export const FIELD_TYPE_COMPONENTS = [
  // types
  FormlyFieldInput,
  FormlyFieldCheckbox,
  FormlyFieldRadio,
  FormlyFieldSelect,
  FormlyFieldTextArea,
  FormlyFieldMultiCheckbox,

  // wrappers
  FormlyWrapperLabel,
  FormlyWrapperDescription,
  FormlyWrapperValidationMessages,
  FormlyWrapperFieldset,
];

export const BOOTSTRAP_FORMLY_CONFIG: ConfigOption = {
  types: [
    {
      name: 'input',
      component: FormlyFieldInput,
      wrappers: ['fieldset', 'label'],
    },
    {
      name: 'checkbox',
      component: FormlyFieldCheckbox,
      wrappers: ['fieldset'],
    },
    {
      name: 'radio',
      component: FormlyFieldRadio,
      wrappers: ['fieldset', 'label'],
    },
    {
      name: 'select',
      component: FormlyFieldSelect,
      wrappers: ['fieldset', 'label'],
    },
    {
      name: 'textarea',
      component: FormlyFieldTextArea,
      wrappers: ['fieldset', 'label'],
    },
    {
      name: 'multicheckbox',
      component: FormlyFieldMultiCheckbox,
      wrappers: ['fieldset', 'label'],
    },
  ],
  wrappers: [
    {name: 'label', component: FormlyWrapperLabel},
    {name: 'description', component: FormlyWrapperDescription},
    {name: 'validation-message', component: FormlyWrapperValidationMessages},
    {name: 'fieldset', component: FormlyWrapperFieldset},
  ],
};
