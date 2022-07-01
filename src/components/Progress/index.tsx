import styles from './Progress.module.css';

const toPercent = (current: number, total: number) => Math.round((current / total) * 100);

interface Props {
  current: number;
  total: number;
  showProgressText?: boolean;
}

const Progress = ({ current, total, showProgressText = true }: Props) => (
  <div className={styles.Progress}>
    <div className={styles.ProgressBar}>
      <div className={styles.ProgressLine} style={{ width: `${toPercent(current, total)}%` }} />
    </div>
    {showProgressText && <div className={styles.ProgressStatus}>{`${current} / ${total}`}</div>}
  </div>
);

export default Progress;
