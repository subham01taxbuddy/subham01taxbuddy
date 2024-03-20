import { Meta, StoryObj } from '@storybook/angular';

import { ChildRegistrationComponent } from './child-registration.component';

type ComponentWithCustomControls = ChildRegistrationComponent;

const meta: Meta<ComponentWithCustomControls> = {
  // title: 'Components/Child Registration',
  component: ChildRegistrationComponent,
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `ChildRegistration` } },
  },
  argTypes: {},
  args: {},
};
export default meta;

export const ChildRegistration: StoryObj<ComponentWithCustomControls> = {
  render: (args: ComponentWithCustomControls) => ({ props: args }),
  args: {},
}
