import { zodFunction } from 'openai/helpers/zod';
import { z } from 'zod';

const NoParameters = z.object({});

export const dateAndTime = zodFunction({
  name: 'dateAndTime',
  description: 'Getting the current date and time.',
  parameters: NoParameters,
  function: (_args = {}) => {
    return new Date().toLocaleString();
  },
});
