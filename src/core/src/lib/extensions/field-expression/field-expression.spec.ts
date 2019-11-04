import { FormControl } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { FormlyFieldConfigCache } from '../../components/formly.field.config';
import { createBuilder } from '@ngx-formly/core/testing';

function buildField({ model, options, ...field }: FormlyFieldConfigCache): FormlyFieldConfigCache {
  const builder = createBuilder({
    extensions: ['core', 'validation', 'form', 'expression'],
  });

  builder.buildField({
    model: model || {},
    options,
    fieldGroup: [field],
  });

  return field;
}

describe('FieldExpressionExtension', () => {
  describe('field visibility (hideExpression)', () => {
    it('should emit fieldChanges on change field visibility', () => {
      const fieldChanges = new Subject<any>();
      const spy = jasmine.createSpy('fieldChanges spy');
      const subscription = fieldChanges.subscribe(spy);

      const field = buildField({
        key: 'text',
        hideExpression: '!model.visibilityToggle',
        options: { fieldChanges },
      });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({ field, type: 'hidden', value: true });

      spy.calls.reset();
      field.model.visibilityToggle = 'test';
      field.options._checkField(field.parent);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({ field, type: 'hidden', value: false });

      subscription.unsubscribe();
    });

    it('should evaluate string expression', () => {
      const field = buildField({
        key: 'text',
        hideExpression: '!model.visibilityToggle',
      });

      expect(field.hide).toBeTruthy();
      expect(field.templateOptions.hidden).toBeTruthy();

      field.model.visibilityToggle = 'test';
      field.options._checkField(field);

      expect(field.hide).toBeFalsy();
      expect(field.templateOptions.hidden).toBeFalsy();
    });

    it('should evaluate function expression', () => {
      const field = buildField({
        key: 'text',
        hideExpression: () => true,
      });

      expect(field.hide).toBeTruthy();
    });

    it('should evaluate boolean expression', () => {
      const field = buildField({
        key: 'text',
        hideExpression: true,
      });

      expect(field.hide).toBeTruthy();
    });

    it('should provide model, formState and field args', () => {
      const spy = jasmine.createSpy('hideExpression spy');
      const field = buildField({
        hideExpression: spy,
      });

      const args = spy.calls.mostRecent().args;
      expect(args[0]).toEqual(field.model);
      expect(args[1]).toEqual(field.options.formState);
      expect(args[2]).toEqual(field);
    });

    describe('attach/detach form control', () => {
      it('should attach form control for displayed field', () => {
        const { formControl } = buildField({ hide: false, key: 'foo' });
        expect(formControl.parent).not.toBeNull();
      });

      it('should detach form control for hidden field', () => {
        const { formControl } = buildField({ hide: true, key: 'foo' });
        expect(formControl.parent).toBeNull();
      });

      it('should toggle form control of child group when key is empty', () => {
        const field = buildField({
          hide: true,
          fieldGroup: [{ fieldGroup: [{ key: 'foo' }] }],
        });
        expect(field.formControl.get('foo')).toBeNull();

        field.hide = false;
        field.options._checkField(field.parent);
        expect(field.formControl.get('foo')).not.toBeNull();
      });

      it('should toggle field control when hide changed programmatically', () => {
        const { fieldGroup: fields, formControl: form, options } = buildField({
          fieldGroup: [
            { hide: false, key: 'foo' },
            { hide: true, fieldGroup: [{key: 'bar'}]},
          ],
        });

        expect(form.get('foo')).not.toBeNull();
        expect(form.get('bar')).toBeNull();

        fields[0].hide = true;
        fields[1].hide = false;
        options._checkField({ formControl: form, fieldGroup: fields, options });

        expect(form.get('foo')).toBeNull();
        expect(form.get('bar')).not.toBeNull();
      });

      it('should toggle controls of the hidden fields before the visible ones', () => {
        const field = buildField({
          model: { type: false },
          fieldGroup: [
            {
              key: 'key1',
              hideExpression: model => model.type,
            },
            {
              key: 'key1',
              hideExpression: model => !model.type,
            },
          ],
        });
        const { options, fieldGroup: fields, formControl: form } = field;

        options._checkField(field);
        expect(fields[0].hide).toBeFalsy();
        expect(fields[0].formControl).toBe(form.get('key1'));
        expect(fields[1].hide).toBeTruthy();
        expect(fields[1].formControl).toBe(form.get('key1'));
      });

      it('should support multiple field with the same key', () => {
        const field = buildField({
          fieldGroup: [
            {
              key: 'key1',
              formControl: new FormControl(),
              hideExpression: model => model.type,
            },
            {
              key: 'key1',
              formControl: new FormControl(),
              hideExpression: model => !model.type,
            },
          ],
        });

        const {
          formControl: form,
          fieldGroup: [f1, f2],
        } = field;

        field.model.type = false;
        field.options._checkField(field.parent);

        expect(f1.hide).toBeFalsy();
        expect(f1.formControl).toBe(form.get('key1'));
        expect(f2.hide).toBeTruthy();
        expect(f2.formControl).not.toBe(form.get('key1'));

        field.model.type = true;
        field.options._checkField(field.parent);
        expect(f1.hide).toBeTruthy();
        expect(f1.formControl).not.toBe(form.get('key1'));
        expect(f2.hide).toBeFalsy();
        expect(f2.formControl).toBe(form.get('key1'));
      });
    });

    it('should not override hide field within fieldGroup', () => {
      const field = buildField({
        hideExpression: () => false,
        fieldGroup: [
          {
            key: 'test',
            hide: true,
          },
        ],
      });

      expect(field.hide).toBeFalsy();
      expect(field.fieldGroup[0].hide).toBeTruthy();
    });
  });

  describe('expressionProperties', () => {
    it('should resolve a string expression', () => {
      const field = buildField({
        key: 'name',
        model: { label: 'test' },
        options: { formState: { className: 'name_test' } },
        expressionProperties: {
          // using formState
          className: 'formState.className',
          // using field
          'templateOptions.key': 'field.key',
          // using model
          'templateOptions.label': 'model.label',
        },
      });

      expect(field.className).toEqual('name_test');
      expect(field.templateOptions.key).toEqual('name');
      expect(field.templateOptions.label).toEqual('test');
    });

    it('should provide model, formState and field args', () => {
      const spy = jasmine.createSpy('hideExpression spy');
      const field = buildField({
        expressionProperties: {
          className: spy,
        },
      });

      const args = spy.calls.mostRecent().args;
      expect(args[0]).toEqual(field.model);
      expect(args[1]).toEqual(field.options.formState);
      expect(args[2]).toEqual(field);
    });

    it('should resolve a function expression', () => {
      const field = buildField({
        model: { label: 'test' },
        expressionProperties: {
          'templateOptions.label': () => 'test',
        },
      });

      expect(field.templateOptions.label).toEqual('test');
    });

    it('should resolve an observable expression', () => {
      const field = buildField({
        expressionProperties: {
          'templateOptions.label': of('test'),
        },
      });

      expect(field.templateOptions.label).toEqual('test');
    });

    describe('model expression', () => {
      it('should resolve a model expression (field key = model key)', () => {
        const field = buildField({
          model: { label: 'test' },
          options: { formState: { className: 'name_test' } },
          key: 'name',
          expressionProperties: {
            'model.name': () => 'name_test',
          },
        });

        expect(field.formControl.value).toEqual('name_test');
        expect(field.model.name).toEqual('name_test');
      });

      it('should resolve a model expression (field key != model key)', () => {
        const field = buildField({
          model: { label: 'test' },
          fieldGroup: [
            {
              key: 'name',
              expressionProperties: {
                'model.custom': () => 'custom_test',
              },
            },
            { key: 'custom' },
          ],
        });

        expect(field.model.custom).toEqual('custom_test');
      });

      it('should resolve a model expression (nested field key)', () => {
        const field = buildField({
          model: { address: {} },
          expressionProperties: {
            'model.address.city': () => 'custom_test',
          },
          fieldGroup: [{ key: 'address', fieldGroup: [{ key: 'city' }] }],
        });

        expect(field.formControl.value).toEqual({ address: { city: 'custom_test' } });
        expect(field.model).toEqual({ address: { city: 'custom_test' } });
      });
    });

    it('should update field validity when using built-in validations expression', () => {
      const formControl = new FormControl();
      spyOn(formControl, 'updateValueAndValidity');

      buildField({
        key: 'checked',
        formControl,
        expressionProperties: {
          'templateOptions.required': 'model.checked',
        },
        model: { checked: true },
      });

      expect(formControl.updateValueAndValidity).toHaveBeenCalledTimes(3);
    });

    describe('field disabled state', () => {
      it('should update field disabled state', () => {
        const field = buildField({
          key: 'text',
          expressionProperties: {
            'templateOptions.disabled': 'model.disableToggle',
          },
        });

        expect(field.templateOptions.disabled).toBeFalsy();

        field.model.disableToggle = 'test';
        field.options._checkField(field);

        expect(field.templateOptions.disabled).toBeTruthy();
      });

      it('should take account of parent disabled state', () => {
        const disabled = {
          address: true,
          city: false,
        };
        const field = buildField({
          key: 'address',
          expressionProperties: { 'templateOptions.disabled': () => disabled.address },
          fieldGroup: [
            {
              key: 'city',
              expressionProperties: { 'templateOptions.disabled': () => disabled.city },
            },
          ],
        });

        expect(field.templateOptions.disabled).toBeTruthy();
        expect(field.fieldGroup[0].templateOptions.disabled).toBeTruthy();

        disabled.address = false;
        field.options._checkField(field);

        expect(field.templateOptions.disabled).toBeFalsy();
        expect(field.fieldGroup[0].templateOptions.disabled).toBeFalsy();

        disabled.city = true;
        field.options._checkField(field);

        expect(field.templateOptions.disabled).toBeFalsy();
        expect(field.fieldGroup[0].templateOptions.disabled).toBeTruthy();
      });
    });
  });
});
