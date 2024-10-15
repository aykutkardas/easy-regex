import { useIntl } from 'react-intl';

import CheatsheetCollapse from 'src/components/CheatsheetCollapse';

import data from 'src/data/cheatsheet.json';

const PlaygroundSidebar = () => {
  const { formatMessage } = useIntl();

  return (
    <div className="overflow-y-scroll p-3 space-y-8 flex-col rounded-md">
      {data.map(row => (
        <div key={row.title} className="bg-neutral-800 rounded-md">
          <div className="mb-3">{formatMessage({ id: row.title })}</div>
          {row.data.map(item => (
            <CheatsheetCollapse
              key={item.title}
              title={formatMessage({ id: item.title })}
              data={item}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default PlaygroundSidebar;
