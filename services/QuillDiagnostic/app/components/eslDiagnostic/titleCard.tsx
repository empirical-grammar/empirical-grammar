import React, { Component } from 'react';
import translations from '../../libs/translations/index.js';
import { commonText } from '../../../public/locales/commonText';
import { ENGLISH, rightToLeftLanguages } from '../../../public/locales/languagePageInfo';

export interface ComponentProps {
  data: any,
  diagnosticID: string,
  language: string,
  handleContinueClick(): void,
  translate(input: string): any
}

class TitleCard extends Component<ComponentProps, any> {

  getContentHTML = () => {
    const { data, language, } = this.props;
    let html = data.content ? data.content : translations.english[data.key];
    if (language !== ENGLISH) {
      const textClass = rightToLeftLanguages.includes(language) ? 'right-to-left arabic-title-div' : '';
      html += `<br/><div class="${textClass}">${translations[language][data.key]}</div>`;
    }
    return html;
  }

  renderContent = () => {
    const { data, diagnosticID, language, translate } = this.props;
    const { title } = data;
    const header = `${title}^header`;
    const text = `${title}^text`;
    
    if(diagnosticID === 'ell') {
      return <div className="landing-page-html" dangerouslySetInnerHTML={{ __html: this.getContentHTML(), }} />;
    } else {
      const textClass = rightToLeftLanguages.includes(language) ? 'right-to-left' : '';
      return(
        <div>
          <div className="landing-page-html">
            <h1>{commonText[title].header}</h1>
            <p>{commonText[title].text}</p>
          </div>
          {language !== ENGLISH && <div className={`landing-page-html ${textClass}`}>
            <h1>{translate(header)}</h1>
            <p>{translate(text)}</p>
          </div>}
        </div>
      );
    }
  }

  render() {
    const { handleContinueClick, translate} = this.props;

    return (
      <div className="landing-page">
        {this.renderContent()}
        <button className="quill-button focus-on-light large contained primary" onClick={handleContinueClick} type="button">
          {translate('buttons^continue')}
        </button>
      </div>
    );
  }
}

export default TitleCard;
