import React from 'react';

interface InsightSectionProps {
  dynamicInsight: {
    headline: string;
    sentence: string;
    chips: Array<{ text: string; tone: 'pos' | 'neg' | 'neu' }>;
  };
}

const InsightSection: React.FC<InsightSectionProps> = ({ dynamicInsight }) => {
  return (
    <div className="flex flex-col gap-2.5 items-start justify-start pb-4 pt-0 px-4 w-full">
      <div className="bg-[#f5f8ff] flex flex-col gap-2 items-start justify-center p-4 rounded-lg w-full h-[101px]">
        <div className="flex flex-col items-start justify-start p-0 w-full">
          <div className="text-[20px] leading-7 font-bold text-[#092540] text-center w-full" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {dynamicInsight.headline}
          </div>
        </div>
        <div className="h-0 w-full relative">
          <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
            <img alt="Line" className="w-full h-px" src="/assets/c5f98cc278369be2d380820eb9a00765a4507302.svg" />
          </div>
        </div>
        <div className="text-[14px] leading-5 font-normal text-[#092540] text-center w-full" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          <div className="mb-0">
            <span dangerouslySetInnerHTML={{ __html: dynamicInsight.sentence }}></span>
            {dynamicInsight.chips.map((c, idx) => (
              <span
                key={idx}
                className={`${c.tone === 'pos' ? 'bg-[#e6faf5] text-[#009688]' : c.tone === 'neg' ? 'bg-[#ffe6e6] text-[#bb3f3f]' : 'bg-[#eef2f5] text-[#3a5166]'} text-[10px] font-bold px-2 py-0.5 rounded-full tracking-[0.3px] ml-2`}
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                {c.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightSection;
