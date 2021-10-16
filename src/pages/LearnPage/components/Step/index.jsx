import "./step.scss";

import { useIntl } from "react-intl";

import tagWrapper from "@utils/tagWrapper";

import InteractiveArea from "../InteractiveArea";

function Steps({ data, step, error: parentError, onChangeSuccess }) {
  const { formatMessage } = useIntl();

  const title = tagWrapper(
    formatMessage({ id: data.title }),
    /`(\S*?[^`]*)`/gim,
    "step-word"
  ).replace(/\\n/gim, "<br/>");

  const description = tagWrapper(
    formatMessage({ id: data.description }),
    /`(\S*?[^`]*)`/gim,
    "step-word"
  ).replace(/\\n/gim, "<br/>");

  const isInteractive = data.interactive !== false;

  return (
    <div className="step">
      <h2 className="step-title" dangerouslySetInnerHTML={{ __html: title }} />
      <p
        className="step-description"
        dangerouslySetInnerHTML={{ __html: description }}
      />
      <InteractiveArea
        isShow={isInteractive}
        data={data}
        step={step}
        parentError={parentError}
        onChangeSuccess={onChangeSuccess}
      />
    </div>
  );
}

export default Steps;
