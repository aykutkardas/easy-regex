import { Popover } from '@headlessui/react';
import Icon from 'src/components/Icon';

interface ErrorType {
  message: string;
  type: string;
}

interface ErrorPopoverProps {
  errors: ErrorType[];
}

const ErrorPopover: React.FC<ErrorPopoverProps> = ({ errors }) => {
  return (
    <Popover className="relative">
      <Popover.Button
        className="select-none cursor-pointer text-neutral-300 hover:bg-neutral-700 mr-[2px] ml-3 w-9 border-dashed border p-2 text-sm h-9 flex items-center justify-center rounded-md border-neutral-600 focus:ring-0 focus:bg-neutral-700"
        aria-label="View Errors"
      >
        <Icon icon="error" size={14} />
      </Popover.Button>

      <Popover.Panel className="absolute z-10 mt-2 flex flex-col gap-y-3 p-2 border w-64 border-neutral-700 bg-neutral-800 shadow-md rounded-md max-h-80 overflow-y-auto">
        {errors.length === 0 ? (
          <div className="text-neutral-400 text-sm">No errors.</div>
        ) : (
          errors.map(({ message, type }) => (
            <div key={type} className="flex items-start">
              <Icon icon="error" size={16} className="text-red-500 mr-2 mt-1 flex-shrink-0" />
              <div>
                <span className="text-xs rounded-md relative tracking-wider text-neutral-300 leading-5 ml-1">
                  {message.split(':').pop()?.trim() || message}
                </span>
              </div>
            </div>
          ))
        )}
      </Popover.Panel>
    </Popover>
  );
};

export default ErrorPopover;
