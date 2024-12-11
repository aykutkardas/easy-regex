import { useState, useEffect, useRef, useCallback, useContext, isValidElement } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import useEventListener from '@use-it/event-listener';
import cx from 'clsx';
import dynamic from 'next/dynamic';
import confetti from 'canvas-confetti';

const ReportStep = dynamic(import('src/components/ReportStep'), { ssr: false });
const Hint = dynamic(import('src/components/Hint'), { ssr: false });
const ErrorPopover = dynamic(import('src/components/ErrorPopover'), { ssr: false });
import FlagBox from 'src/components/FlagBox';
import Icon from 'src/components/Icon';
import setCaretPosition from 'src/utils/setCaretPosition';
import tagWrapper from 'src/utils/tagWrapper';
import checkRegex from 'src/utils/checkRegex';
import { InteractiveAreaContext } from 'src/context/InteractiveAreaContext';

interface Props {
  isShow?: boolean;
  setIsOpenModal: Function;
}

const InteractiveArea = ({ isShow, setIsOpenModal }: Props) => {
  const {
    data,
    lessonData,
    step,
    lastStep,
    nextStep,
    prevStep,
    success,
    setSuccess,
    match,
    setMatch,
    error,
    setError,
    lockError,
  } = useContext(InteractiveAreaContext);

  const { formatMessage } = useIntl();
  const regexInput = useRef<HTMLInputElement>(null);
  const [regex, setRegex] = useState(data.initialValue || '');
  const [isvalidRegexSyntax, setIsvalidRegexSyntax] = useState(true);
  const [errors, setErrors] = useState([]);
  const [flags, setFlags] = useState(data.initialFlags || '');
  const [content, setContent] = useState('');
  const [isChanged, setIsChanged] = useState(false);
  const [skip, setSkip] = useState(false);

  const skipStep = () => {
    setRegex(data.regex[0]);
    setFlags(data.flags);
    setError(false);
    setSuccess(true);
    setMatch(true);
    setSkip(true);
  };

  useEffect(() => {
    setCaretPosition(regexInput.current, data.cursorPosition || 0);

    if (lastStep > step) {
      const newRegex = data.regex?.[0];
      const newFlags = data.flags;

      setRegex(newRegex);
      setFlags(newFlags);
      setSuccess(true);
      applyRegex(newRegex, newFlags);

      return;
    }

    if (step === lessonData.length - 1) {
      confetti({
        particleCount: 400,
        startVelocity: 30,
        gravity: 0.5,
        spread: 350,
        origin: {
          x: 0.5,
          y: 0.4,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkBrowserSupport = useCallback(() => {
    try {
      checkRegex(data, { regex, flags });
      return true;
    } catch (error) {
      return false;
    }
  }, [data, regex, flags]);

  const applyRegex = (regex, flags) => {
    if (skip) return;
    if (data.interactive === false) return;

    if (data.safariAccept) {
      const isTrueRegex = data.regex[0] == regex;
      setError(!isTrueRegex);
      setSuccess(isTrueRegex);

      if (!checkBrowserSupport()) return;
    }

    const { isSuccess, isMatch, error, regex: grouppedRegex } = checkRegex(data, { regex, flags });

    if (error) {
      setError(true);
      setMatch(false);
      setSuccess(false);
      if (error.type === 'InvalidRegex') {
        setIsvalidRegexSyntax(false);
        setErrors([error]);
      } else {
        setIsvalidRegexSyntax(true);
        setErrors([]);
      }
      return;
    }
    setError(false);
    setMatch(isMatch);
    setSuccess(isSuccess);

    if (!regex) {
      setContent(data.content);
    } else {
      setContent(
        tagWrapper({
          value: data.content,
          regex: grouppedRegex,
          attributes: {
            class: 'highlight shadow-sm h-3 mr-[1px] my-[1px] px-1 py-[2px] rounded-md text-black',
          },
        }),
      );
    }

    if ((isChanged && isSuccess) || isMatch) {
      setError(false);
    } else {
      setError(true);
    }
  };

  const onChange = e => {
    setIsChanged(true);
    setRegex(e.target.value);
    applyRegex(e.target.value, flags);
  };

  const onFocus = e => {
    if (data.readOnly) {
      return;
    }

    onChange(e);
  };

  const focusInput = () => {
    regexInput?.current?.focus();
  };

  const handleChangeFlags = flags => {
    let newFlags = '';
    if (flags.includes('g')) {
      newFlags += 'g';
    }
    if (flags.includes('m')) {
      newFlags += 'm';
    }
    if (flags.includes('i')) {
      newFlags += 'i';
    }
    setFlags(newFlags);
    setIsChanged(true);
    applyRegex(regex, newFlags);
  };

  const handleFocus = e => {
    if (e.keyCode !== 9) return;
    e.preventDefault();
    focusInput();
  };

  const handleChangeStep = e => {
    if (e.ctrlKey) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        prevStep();
      } else {
        nextStep();
      }
    }
  };

  useEventListener('keypress', e => {
    handleChangeStep(e);
    handleFocus(e);
  });

  if (!isShow) return null;

  const readableContent = (content || data.content || '').replace(/\n/gm, '<br />');

  const placeholder = formatMessage({
    id: 'general.regex',
  }).toLowerCase();

  return (
    <div
      dir="ltr"
      className={cx({
        '[&_.highlight]:bg-red-400 ': error,
        '[&_.highlight]:bg-yellow-600': match,
        '[&_.highlight]:!bg-regreen-400': success,
        '[&_.regex-block]:outline [&_.regex-block]:outline-1  [&_.regex-block]:outline-red-400':
          lockError,
      })}
    >
      {data.safariAccept && (
        <button
          className="text-yellow-500 hover:text-yellow-400 text-xs px-3 py-1 mx-auto flex rounded-md mt-3 underline underline-offset-2"
          onClick={skipStep}
        >
          <FormattedMessage id="learn.safari.unsupportWarning" />
        </button>
      )}
      <div
        className={cx(
          'bg-jet-400 my-5 p-3 pt-5 text-xs rounded-md relative tracking-wider text-neutral-300 leading-5',
          'block text-left w-full items-start',
          'before:content-[attr(data-title)] before:absolute before:-top-3 before:left-2 before:bg-jet-500 before:text-[10px] before:text-neutral-400 before:py-1 before:px-2 before:rounded-md',
        )}
        data-title={formatMessage({ id: 'general.text' })}
        dangerouslySetInnerHTML={{ __html: readableContent }}
      />
      <div
        className={cx(
          'bg-jet-400 mt-5 p-3 pt-5 text-xs rounded-md relative tracking-wider text-neutral-300 flex flex-col items-center justify-center',
          'regex-block',
          'before:content-[attr(data-title)] before:absolute before:-top-3 before:left-2 before:bg-jet-500 before:text-[10px] before:text-neutral-400 before:py-1 before:px-2 before:rounded-md',
        )}
        data-title={formatMessage({ id: 'general.regex' })}
      >
        <ReportStep title={data.title} step={step} />

        {!data.noHint && (
          <Hint hiddenFlags={data.hiddenFlags} regex={data.regex} flags={data.flags} />
        )}
        <div className="flex items-center">
          <div
            className={cx(
              'bg-jet-500 px-4 py-1 mb-3 rounded-md flex items-center justify-center max-w-[90%]',
              "before:content-['/'] before:text-neutral-500",
              "after:content-['/'_attr(data-flags)] after:text-neutral-500",
              { 'after:hidden before:hidden': data.hiddenFlags },
            )}
            data-flags={flags}
          >
            <input
              ref={regexInput}
              key={step}
              type="text"
              className={cx({
                'bg-transparent border-0 outline-none !ring-0 text-center max-w-[440px] min-w-[60px] px-2 text-sm tracking-widest':
                  true,
                'text-regreen-400': isvalidRegexSyntax,
                'text-red-400': !isvalidRegexSyntax,
              })}
              style={{ width: regex.length * 12 || 60 }}
              readOnly={data.readOnly}
              value={data.visibleRegex || regex}
              onChange={onChange}
              onFocus={onFocus}
              placeholder={placeholder}
              spellCheck={false}
            />
          </div>
          <div className="mb-3 w-12">{errors.length > 0 && <ErrorPopover errors={errors} />}</div>
        </div>
        {data.videoURL && (
          <div
            className="inline-flex items-center mr-auto text-[10px] opacity-70 transition-opacity hover:opacity-100 text-neutral-100 cursor-pointer font-sans font-normal"
            onClick={() => setIsOpenModal(true)}
          >
            <Icon icon="video-camera" size={16} className="mr-1 text-red-400" />
            <FormattedMessage id="general.watch" />
          </div>
        )}
        {data.useFlagsControl && <FlagBox flags={flags} setFlags={handleChangeFlags} />}
      </div>
    </div>
  );
};

export default InteractiveArea;
