import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from 'src/components/Icon';

import packageInfo from '../../../package.json';

import * as styles from 'src/components/ReportStep/ReportStep.module.css';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const ReportPlayground = () => {
  const [body, setBody] = useState('');
  const { query } = useRouter();
  const { lang } = query;

  const title = encodeURI('[Playground]: Type the title here...');

  useEffect(() => {
    setBody(
      encodeURI(`
**Page:** \`Playground\`
**Language:** \`${lang}\`
**Version:** \`v${packageInfo.version}\`

**User Agent:** 
\`${window.navigator.userAgent.replace(/;/g, ',')}\`

---

**What is the problem you are experiencing?**
    
    
    `),
    );
  }, [lang]);

  return (
    <div className={styles.ReportStep}>
      <a
        className={styles.ReportStepLink}
        href={`https://github.com/aykutkardas/regexlearn.com/issues/new?title=${title}&body=${body}`}
        target="_blank"
        rel="noreferrer"
      >
        <Icon icon="bell" size={10} />
        <span>
          <FormattedMessage id="general.reportStep" />
        </span>
      </a>
    </div>
  );
};

export default ReportPlayground;