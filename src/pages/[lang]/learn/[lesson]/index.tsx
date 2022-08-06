import { GetStaticPaths, GetStaticProps } from 'next';

import Header from 'src/components/Header';
import CustomHead from 'src/components/CustomHead';
import LearnFooter from 'src/components/LearnFooter';
import Step from 'src/components/Step';
import { defaultLocale, locales } from 'src/localization';
import lessons from 'src/data/lessons/index.json';
import { Lesson } from 'src/types';
import { InteractiveAreaProvider } from 'src/context/InteractiveAreaContext';
type PageLessonProps = {
  lesson: Lesson;
};

const PageLesson = ({ lesson }: PageLessonProps) => {
  const data = require(`src/data/lessons/${lesson.key}.js`)?.default;

  return (
    <>
      <CustomHead
        title={`lessons.${lesson.key}.title`}
        description={`lessons.${lesson.key}.description`}
        hrefLang={`learn/${lesson.slug}`}
      >
        <link rel="stylesheet" href="/css/animate.css" />
      </CustomHead>
      <Header isLearnPage />
      <InteractiveAreaProvider key={data} lesson={lesson} data={data}>
        <Step />
        <LearnFooter />
      </InteractiveAreaProvider>
    </>
  );
};

export default PageLesson;

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const lang = params.lang || defaultLocale;
  const messages = require(`src/localization/${lang}/`)?.default;
  const lesson = lessons.find(({ slug }) => slug === params.lesson);

  return {
    props: {
      lang,
      messages,
      lesson,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = [];

  locales.forEach(lang => {
    lessons.forEach(lesson => {
      paths.push({
        params: {
          lang,
          lesson: lesson.slug,
        },
      });
    });
  });

  return {
    fallback: false,
    paths,
  };
};
