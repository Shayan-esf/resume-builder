import React from "react";
import svgPaths from "./svg-v5tirijsol";
import imgImageRemovebgPreview1 from "./f19c8a1111418698f76f1a8b682139e7e5463686.png";
import imgLogo from "./158ab3494402c2fb39a9d6f04713b2c4be58a595.png";
import imgLogo1 from "./5f3994920b0898b280e514dc6259f446af42ee06.png";
import { imgGroup } from "./svg-65zxj";
import { useResume } from "@/context/ResumeContext";
import { RichText } from "@/components/RichText";

function Frame20() {
  const { data, effectiveTailoredContent } = useResume();
  return (
    <div className="content-stretch flex flex-col gap-[5px] items-start relative shrink-0 w-full">
      <p
        className="bg-clip-text font-['Outfit',sans-serif] font-bold leading-[14px] relative shrink-0 text-[10px] text-[transparent] tracking-[0.12em] uppercase w-full whitespace-nowrap"
        style={{
          backgroundImage: "linear-gradient(90deg, #0284c7 0%, #0585c0 50%, #38bdf8 100%)",
        }}
      >
        {effectiveTailoredContent ? effectiveTailoredContent.headlineRole : data.profile.role}
      </p>
      <div className="flex flex-col font-['Outfit',sans-serif] font-extrabold text-[#0f172a] text-[18.5px] leading-[22px] tracking-[-0.03em] w-full">
        <span className="whitespace-nowrap block">{data.profile.firstName}</span>
        <span className="whitespace-nowrap block">{data.profile.lastName}</span>
      </div>
    </div>
  );
}

function Header() {
  const { data, effectiveTailoredContent } = useResume();
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[5px] items-start justify-center not-italic relative shrink-0 w-full" data-name="Header">
      <Frame20 />
      <p className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold leading-[13px] relative shrink-0 text-[#0284c7] text-[8.5px] tracking-[0.01em] w-full" dir="auto">
        {effectiveTailoredContent ? effectiveTailoredContent.headlineSubtitle : data.profile.subtitle}
      </p>
    </div>
  );
}

function Divider() {
  return <div className="h-[0.5px] relative shrink-0 w-full" data-name="Divider" />;
}

function EmailIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="9.5"
      height="8.5"
      viewBox="0 0 16 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="paint_email_curved_gradient"
          x1="1"
          y1="13"
          x2="15"
          y2="1"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0284C7" />
          <stop offset="1" stopColor="#7DD3FC" />
        </linearGradient>
      </defs>
      {/* Softly curved envelope body with organic pill corners */}
      <rect
        x="1"
        y="1"
        width="14"
        height="12"
        rx="3.5"
        fill="url(#paint_email_curved_gradient)"
      />
      {/* Smooth dipping curved flap */}
      <path
        d="M2.5 3.5C4.8 5.8 6.4 7.4 8 7.4C9.6 7.4 11.2 5.8 13.5 3.5"
        stroke="#FFFFFF"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Soft curved bottom fold accents */}
      <path
        d="M2.8 10.8C4.6 9 5.7 8 6.8 7.4M13.2 10.8C11.4 9 10.3 8 9.2 7.4"
        stroke="#FFFFFF"
        strokeWidth="0.95"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />
    </svg>
  );
}

function FeaturedIcon() {
  return (
    <div className="bg-[rgba(0,0,0,0)] overflow-clip relative rounded-[100px] shrink-0 size-[16px] flex items-center justify-center" data-name="Featured icon">
      <div className="absolute bg-gradient-to-b from-[rgba(5,133,192,0.16)] inset-0 rounded-[100px] to-[rgba(5,133,192,0.08)]" data-name="Rectangle" />
      <div className="relative z-10 flex items-center justify-center">
        <EmailIcon />
      </div>
    </div>
  );
}

function Text() {
  const { data } = useResume();
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col items-start min-w-px not-italic relative" data-name="Text">
      <p className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold leading-[8px] relative shrink-0 text-[#64748b] text-[6.5px] uppercase tracking-[0.08em] w-full">
        Email
      </p>
      <a className="block font-['Plus_Jakarta_Sans',sans-serif] font-semibold leading-[0] relative shrink-0 text-[#0f172a] text-[7.5px] tracking-[-0.01em] hover:text-[#0284c7] transition-colors w-full" href={`mailto:${data.contact.email}`} target="_blank">
        <p className="cursor-pointer leading-[10px]" dir="auto">
          {data.contact.email}
        </p>
      </a>
    </div>
  );
}

function Row() {
  return (
    <div className="content-stretch flex gap-[5px] items-center relative shrink-0 w-full" data-name="Row">
      <FeaturedIcon />
      <Text />
    </div>
  );
}

function Elements1() {
  return (
    <div className="absolute inset-[5.21%]" data-name="elements">
      <svg className="absolute block inset-0 size-full" fill="none" height="7.16668" preserveAspectRatio="none" viewBox="0 0 7.16671 7.16668" width="7.16671">
        <g id="elements">
          <path d={svgPaths.p3002f780} fill="url(#paint0_linear_0_88)" id="Union" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_0_88" x1="4.58329" x2="5.52862" y1="8.08332" y2="-2.46353">
            <stop stopColor="#0585C0" />
            <stop offset="1" stopColor="#ACE2FB" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function FeaturedIcon1() {
  return (
    <div className="bg-[rgba(0,0,0,0)] overflow-clip relative rounded-[100px] shrink-0 size-[16px] flex items-center justify-center" data-name="Featured icon">
      <div className="absolute bg-gradient-to-b from-[rgba(5,133,192,0.16)] inset-0 rounded-[100px] to-[rgba(5,133,192,0.08)]" data-name="Rectangle" />
      <div className="relative z-10 flex items-center justify-center size-[8px]" data-name="call">
        <Elements1 />
      </div>
    </div>
  );
}

function Text1() {
  const { data } = useResume();
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col items-start min-w-px not-italic relative" data-name="Text">
      <p className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold leading-[8px] relative shrink-0 text-[#64748b] text-[6.5px] uppercase tracking-[0.08em] w-full">
        Phone
      </p>
      <p className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold leading-[10px] relative shrink-0 text-[#0f172a] text-[7.5px] tracking-[-0.01em] w-full" dir="auto">
        {data.contact.phone}
      </p>
    </div>
  );
}

function Row1() {
  return (
    <div className="content-stretch flex gap-[5px] items-center relative shrink-0 w-full" data-name="Row">
      <FeaturedIcon1 />
      <Text1 />
    </div>
  );
}

function Elements2() {
  return (
    <div className="absolute inset-[8.33%]" data-name="elements">
      <svg className="absolute block inset-0 size-full" fill="none" height="6.66699" preserveAspectRatio="none" viewBox="0 0 6.66699 6.66699" width="6.66699">
        <g id="elements">
          <path d={svgPaths.p3bc19980} fill="url(#paint0_linear_0_92)" id="Union" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_0_92" x1="3.83325" x2="3.33325" y1="8.33331" y2="-1.66669">
            <stop stopColor="#0585C0" />
            <stop offset="1" stopColor="#ACE2FB" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function FeaturedIcon2() {
  return (
    <div className="bg-[rgba(0,0,0,0)] overflow-clip relative rounded-[100px] shrink-0 size-[16px] flex items-center justify-center" data-name="Featured icon">
      <div className="absolute bg-gradient-to-b from-[rgba(5,133,192,0.16)] inset-0 rounded-[100px] to-[rgba(5,133,192,0.08)]" data-name="Rectangle" />
      <div className="relative z-10 flex items-center justify-center size-[8px]" data-name="linkedin-02">
        <Elements2 />
      </div>
    </div>
  );
}

function Text2() {
  const { data } = useResume();
  const linkedinUrl = data.contact?.linkedin?.url || "https://www.linkedin.com/in/shayan-esf/";
  const linkedinHandle = data.contact?.linkedin?.handle || "@shayan-esf";

  return (
    <div className="[word-break:break-word] content-stretch flex flex-col items-start leading-[0] min-w-px not-italic relative whitespace-nowrap" data-name="Text">
      <a className="block font-['Plus_Jakarta_Sans',sans-serif] font-semibold relative shrink-0 text-[#64748b] text-[6.5px] uppercase tracking-[0.08em]" href={linkedinUrl} target="_blank">
        <p className="cursor-pointer leading-[8px]">
          LinkedIn
        </p>
      </a>
      <a className="block font-['Plus_Jakarta_Sans',sans-serif] font-semibold relative shrink-0 text-[#0f172a] text-[7.5px] tracking-[-0.01em] hover:text-[#0284c7] transition-colors" href={linkedinUrl} target="_blank">
        <p className="cursor-pointer leading-[10px]" dir="auto">
          {linkedinHandle}
        </p>
      </a>
    </div>
  );
}

function Row2() {
  return (
    <div className="content-stretch flex gap-[5px] items-center relative shrink-0 w-full" data-name="Row">
      <FeaturedIcon2 />
      <Text2 />
    </div>
  );
}

function UxcelIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="7" height="8" viewBox="0 0 7 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="paint0_linear_1_1468" x1="4.02472" y1="9.70742" x2="3.37883" y2="-1.93528" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0585C0" />
          <stop offset="1" stopColor="#ACE2FB" />
        </linearGradient>
      </defs>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.94434 0.149017C3.28812 -0.0496581 3.71188 -0.0496581 4.05566 0.149017L6.44531 1.52988C6.78845 1.72827 6.99987 2.09447 7 2.49081V5.27499C6.9999 5.67135 6.78846 6.03754 6.44531 6.23593L4.05566 7.61679C3.71188 7.81545 3.28812 7.81545 2.94434 7.61679L0.554688 6.23593C0.211538 6.03754 0.000104802 5.67135 0 5.27499V2.49081C0.000134535 2.09446 0.211545 1.72826 0.554688 1.52988L2.94434 0.149017ZM1.67578 2.85312C1.63618 2.83034 1.58701 2.85922 1.58691 2.90488V3.44687C1.58706 3.48955 1.60936 3.52932 1.64648 3.55038L2.45801 4.00839C2.48289 4.02248 2.49901 4.04915 2.49902 4.07773V4.69394C2.49902 4.71672 2.47394 4.73152 2.4541 4.72031L1.63086 4.25449C1.61106 4.24343 1.58691 4.25814 1.58691 4.28085V4.8746C1.58691 4.91699 1.60886 4.95682 1.64551 4.97812L3.04395 5.78476C3.08359 5.80756 3.1328 5.77877 3.13281 5.733V3.76328C3.13281 3.72074 3.11008 3.68101 3.07324 3.65976L1.67578 2.85312ZM5.32422 2.85312L3.92676 3.65976C3.88992 3.68101 3.86719 3.72074 3.86719 3.76328V5.733C3.8672 5.77873 3.91645 5.80747 3.95605 5.78476L5.35449 4.97812C5.39121 4.95684 5.41406 4.91703 5.41406 4.8746V4.28085C5.41406 4.2581 5.38896 4.24333 5.36914 4.25449L4.5459 4.72031C4.52607 4.73152 4.50195 4.71672 4.50195 4.69394V4.07773C4.50196 4.04915 4.51711 4.02248 4.54199 4.00839L5.35352 3.55038C5.39069 3.52933 5.41392 3.48959 5.41406 3.44687V2.90488C5.41397 2.85918 5.36384 2.83024 5.32422 2.85312ZM3.61816 1.76816C3.5452 1.7266 3.45483 1.7266 3.38184 1.76816L2.23145 2.42343C2.19181 2.44628 2.19175 2.50403 2.23145 2.52695L2.80664 2.85898C2.83081 2.87288 2.86043 2.8726 2.88477 2.85898L3.46094 2.53574C3.48502 2.52225 3.51497 2.52226 3.53906 2.53574L4.11523 2.85898C4.13956 2.87263 4.16918 2.87284 4.19336 2.85898L4.76855 2.52695C4.80827 2.50401 4.80829 2.44625 4.76855 2.42343L3.61816 1.76816Z"
        fill="url(#paint0_linear_1_1468)"
      />
    </svg>
  );
}

function LinkChainIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="paint0_linear_1_1923" x1="4.3122" y1="9.37452" x2="3.74973" y2="-1.87493" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0585C0" />
          <stop offset="1" stopColor="#ACE2FB" />
        </linearGradient>
      </defs>
      <path d="M2.19866 7.49999C1.30947 7.49999 0.50782 6.96436 0.167483 6.14287C-0.172854 5.32138 0.015131 4.37577 0.643793 3.74692L1.57689 2.81382L2.19866 3.43559L1.266 4.36825C0.932719 4.70154 0.802556 5.18731 0.924547 5.64259C1.04654 6.09787 1.40215 6.45348 1.85742 6.57547C2.3127 6.69746 2.79847 6.5673 3.13176 6.23401L4.06442 5.30135L4.68619 5.92356L3.75353 6.85622C3.34198 7.2698 2.78211 7.5016 2.19866 7.49999ZM2.50955 5.61224L1.88778 4.99046L4.99708 1.88116L5.61885 2.50293L2.50955 5.61224ZM5.93017 4.67958L5.30796 4.0578L6.24062 3.12514C6.57844 2.79286 6.71209 2.30491 6.59075 1.84685C6.4694 1.38879 6.1117 1.03101 5.65368 0.909557C5.19565 0.788103 4.70767 0.921638 4.3753 1.25938L3.44221 2.19204L2.82043 1.57027L3.75353 0.637171C4.61323 -0.215034 6.00008 -0.211997 6.85604 0.643965C7.712 1.49993 7.71503 2.88677 6.86283 3.74648L5.93017 4.67958Z" fill="#141B34" />
      <path d="M2.19866 7.49999C1.30947 7.49999 0.50782 6.96436 0.167483 6.14287C-0.172854 5.32138 0.015131 4.37577 0.643793 3.74692L1.57689 2.81382L2.19866 3.43559L1.266 4.36825C0.932719 4.70154 0.802556 5.18731 0.924547 5.64259C1.04654 6.09787 1.40215 6.45348 1.85742 6.57547C2.3127 6.69746 2.79847 6.5673 3.13176 6.23401L4.06442 5.30135L4.68619 5.92356L3.75353 6.85622C3.34198 7.2698 2.78211 7.5016 2.19866 7.49999ZM2.50955 5.61224L1.88778 4.99046L4.99708 1.88116L5.61885 2.50293L2.50955 5.61224ZM5.93017 4.67958L5.30796 4.0578L6.24062 3.12514C6.57844 2.79286 6.71209 2.30491 6.59075 1.84685C6.4694 1.38879 6.1117 1.03101 5.65368 0.909557C5.19565 0.788103 4.70767 0.921638 4.3753 1.25938L3.44221 2.19204L2.82043 1.57027L3.75353 0.637171C4.61323 -0.215034 6.00008 -0.211997 6.85604 0.643965C7.712 1.49993 7.71503 2.88677 6.86283 3.74648L5.93017 4.67958Z" fill="url(#paint0_linear_1_1923)" />
    </svg>
  );
}

function FeaturedIcon3() {
  return (
    <div className="bg-[rgba(0,0,0,0)] overflow-clip relative rounded-[100px] shrink-0 size-[16px] flex items-center justify-center" data-name="Featured icon">
      <div className="absolute bg-gradient-to-b from-[rgba(5,133,192,0.16)] inset-0 rounded-[100px] to-[rgba(5,133,192,0.08)]" data-name="Rectangle" />
      <div className="relative z-10 flex items-center justify-center">
        <UxcelIcon />
      </div>
    </div>
  );
}

function Text3() {
  const { data } = useResume();
  const uxcelUrl = data.contact?.uxcel?.url || "https://app.uxcel.com/ux/shayanesf";
  const uxcelHandle = data.contact?.uxcel?.handle || "shayanesf";

  return (
    <div className="[word-break:break-word] content-stretch flex flex-col items-start leading-[0] min-w-px not-italic relative" data-name="Text">
      <a className="block font-['Plus_Jakarta_Sans',sans-serif] font-semibold min-w-full relative shrink-0 text-[#64748b] text-[6.5px] uppercase tracking-[0.08em] w-[min-content]" href={uxcelUrl} target="_blank">
        <p className="cursor-pointer leading-[8px]">Uxcel</p>
      </a>
      <a className="block font-['Plus_Jakarta_Sans',sans-serif] font-semibold relative shrink-0 text-[#0f172a] text-[7.5px] tracking-[-0.01em] hover:text-[#0284c7] transition-colors whitespace-nowrap" href={uxcelUrl} target="_blank">
        <p className="cursor-pointer leading-[10px]" dir="auto">
          {uxcelHandle}
        </p>
      </a>
    </div>
  );
}

function Row3() {
  return (
    <div className="content-stretch flex gap-[5px] items-center relative shrink-0 w-full" data-name="Row">
      <FeaturedIcon3 />
      <Text3 />
    </div>
  );
}

function FeaturedIcon4() {
  return (
    <div className="overflow-clip relative rounded-[100px] shrink-0 size-[16px] flex items-center justify-center" data-name="Featured icon">
      <div className="absolute bg-gradient-to-b from-[rgba(5,133,192,0.16)] inset-0 rounded-[100px] to-[rgba(5,133,192,0.08)]" data-name="Rectangle" />
      <div className="relative z-10 flex items-center justify-center">
        <LinkChainIcon />
      </div>
    </div>
  );
}

function Text4() {
  const { data } = useResume();
  const websiteHandle = data.contact.website?.handle || "esfahanizadeh.vercel.app";
  const websiteUrl = data.contact.website?.url || "https://esfahanizadeh.vercel.app/";

  return (
    <div className="[word-break:break-word] content-stretch flex flex-col items-start leading-[0] min-w-px not-italic relative whitespace-nowrap" data-name="Text">
      <a className="block font-['Plus_Jakarta_Sans',sans-serif] font-semibold relative shrink-0 text-[#64748b] text-[6.5px] uppercase tracking-[0.08em]" href={websiteUrl} target="_blank">
        <p className="cursor-pointer leading-[8px]">Website</p>
      </a>
      <a className="block font-['Plus_Jakarta_Sans',sans-serif] font-semibold relative shrink-0 text-[#0f172a] text-[7.5px] tracking-[-0.01em] hover:text-[#0284c7] transition-colors" href={websiteUrl} target="_blank">
        <p className="cursor-pointer leading-[10px]" dir="auto">
          {websiteHandle}
        </p>
      </a>
    </div>
  );
}

function Row4() {
  return (
    <div className="content-stretch flex gap-[5px] items-center relative shrink-0 w-full" data-name="Row">
      <FeaturedIcon4 />
      <Text4 />
    </div>
  );
}

function Infos() {
  return (
    <div className="content-stretch flex flex-col gap-[5px] items-start relative shrink-0 w-full" data-name="Infos">
      <Row />
      <Row1 />
      <Row2 />
      <Row3 />
      <Row4 />
    </div>
  );
}

function Divider1() {
  return (
    <div className="h-[0.5px] overflow-clip relative shrink-0 w-full" data-name="Divider">
      <div className="absolute border-7 border-[#e2e6ee] border-solid inset-0" data-name="divider" />
    </div>
  );
}

function LabelXs() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="label-xs">
      <p className="[word-break:break-word] font-['DM_Sans:Medium',sans-serif] font-medium leading-[11px] relative shrink-0 text-[#626c85] text-[7px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        Product Management Skills
      </p>
    </div>
  );
}

function Labels() {
  return (
    <div className="content-stretch flex gap-[4px] items-start relative shrink-0 w-full" data-name="labels">
      <div className="relative shrink-0" data-name="label">
        <div className="content-stretch flex items-start relative size-full">
          <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
                <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">{` Product Strategy`}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative shrink-0" data-name="label">
        <div className="content-stretch flex items-start relative size-full">
          <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
                <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">OKRs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative shrink-0" data-name="label">
        <div className="content-stretch flex items-start relative size-full">
          <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
                <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">{` PRD`}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Labels1() {
  return (
    <div className="content-stretch flex gap-[2px] items-start relative shrink-0 w-full" data-name="labels">
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">Product Discovery</p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">Agile/Scrum</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Labels2() {
  return (
    <div className="content-stretch flex gap-[2px] items-start relative shrink-0 w-full" data-name="labels">
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">User Research</p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">{` Product Marketing`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Labels3() {
  return (
    <div className="content-stretch flex gap-[2px] items-start relative shrink-0 w-full" data-name="labels">
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">Product Roadmap</p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">Prototyping</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Labels4() {
  return (
    <div className="content-stretch flex gap-[2px] items-start relative shrink-0 w-full" data-name="labels">
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">JTBD</p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">Growth Hacking</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Labels5() {
  return (
    <div className="content-stretch flex gap-[2px] items-start relative shrink-0 w-full" data-name="labels">
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">Prioritization</p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">Stakeholder Management</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame24() {
  return (
    <div className="content-stretch flex flex-col gap-[5px] items-start justify-center relative shrink-0 w-full">
      <LabelXs />
      <Labels />
      <Labels1 />
      <Labels2 />
      <Labels3 />
      <Labels4 />
      <Labels5 />
    </div>
  );
}

function LabelXs1() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="label-xs">
      <p className="[word-break:break-word] font-['DM_Sans:Medium',sans-serif] font-medium leading-[11px] relative shrink-0 text-[#626c85] text-[7px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>{`Languages & Frameworks`}</p>
    </div>
  );
}

function Labels6() {
  return (
    <div className="content-stretch flex gap-[4px] items-start relative shrink-0 w-full" data-name="labels">
      <div className="relative shrink-0" data-name="label">
        <div className="content-stretch flex items-start relative size-full">
          <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
                <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">Javascript</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative shrink-0" data-name="label">
        <div className="content-stretch flex items-start relative size-full">
          <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
                <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">TypeScript</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative shrink-0" data-name="label">
        <div className="content-stretch flex items-start relative size-full">
          <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
                <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">Angular</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Labels7() {
  return (
    <div className="content-stretch flex gap-[2px] items-start relative shrink-0 w-full" data-name="labels">
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">React</p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">Tailwind</p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">Bootstrap</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame25() {
  return (
    <div className="content-stretch flex flex-col gap-[5px] items-start justify-center relative shrink-0 w-full">
      <LabelXs1 />
      <Labels6 />
      <Labels7 />
    </div>
  );
}

function LabelXs2() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="label-xs">
      <p className="[word-break:break-word] font-['DM_Sans:Medium',sans-serif] font-medium leading-[11px] relative shrink-0 text-[#626c85] text-[7px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        Knowledgeable Skills
      </p>
    </div>
  );
}

function Labels8() {
  return (
    <div className="content-stretch flex gap-[2px] items-start relative shrink-0 w-full" data-name="labels">
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">Product Analytics</p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">Business Strategy</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Labels9() {
  return (
    <div className="content-stretch flex gap-[2px] items-start relative shrink-0 w-[144px]" data-name="labels">
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">CI/CD</p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">Unit Test</p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">A/B Testing</p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">SQL</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Labels10() {
  return (
    <div className="content-stretch flex gap-[2px] items-start relative shrink-0 w-[144px]" data-name="labels">
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">GTM</p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">UI/UX</p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">AI-Assisted Design</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame22() {
  return (
    <div className="content-stretch flex flex-col gap-[5px] items-start justify-center relative shrink-0 w-full">
      <LabelXs2 />
      <Labels8 />
      <Labels9 />
      <Labels10 />
    </div>
  );
}

function LabelXs3() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="label-xs">
      <p className="[word-break:break-word] font-['DM_Sans:Medium',sans-serif] font-medium leading-[11px] relative shrink-0 text-[#626c85] text-[7px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        Tools
      </p>
    </div>
  );
}

function Labels11() {
  return (
    <div className="content-stretch flex gap-[2px] items-start relative shrink-0 w-full" data-name="labels">
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">GIt</p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">GitLab</p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">Azure DevOps</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Labels12() {
  return (
    <div className="content-stretch flex gap-[2px] items-start relative shrink-0 w-full" data-name="labels">
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">Figma</p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">Swagger</p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">Notion</p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">Jira</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Labels13() {
  return (
    <div className="content-stretch flex gap-[2px] items-start relative shrink-0 w-full" data-name="labels">
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">GTM</p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">Google Analytics</p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] relative rounded-[3px] shrink-0 to-[rgba(5,133,192,0.08)]" data-name="label">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[3px] py-px relative size-full">
            <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#181c29] text-[7px] whitespace-nowrap">clarity</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame23() {
  return (
    <div className="content-stretch flex flex-col gap-[5px] items-start justify-center relative shrink-0 w-full">
      <LabelXs3 />
      <Labels11 />
      <Labels12 />
      <Labels13 />
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex flex-col gap-[5px] items-start justify-center relative shrink-0 w-full" data-name="content">
      <Frame24 />
      <Frame25 />
      <Frame22 />
      <Frame23 />
    </div>
  );
}

function Contents() {
  return (
    <div className="content-stretch flex flex-col gap-[5px] items-start relative shrink-0 w-full" data-name="contents">
      <p className="[word-break:break-word] capitalize font-['DM_Sans:Medium',sans-serif] font-medium leading-[9px] not-italic relative shrink-0 text-[9px] text-black tracking-[-0.18px] whitespace-nowrap">My Skills</p>
      <Content />
    </div>
  );
}

function SkillsSection() {
  const { effectiveTailoredContent } = useResume();
  if (effectiveTailoredContent) {
    return (
      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="skills-section">
        <div className="content-stretch flex flex-col gap-[5px] items-start relative shrink-0 w-full" data-name="contents">
          <p className="[word-break:break-word] capitalize font-['DM_Sans:Medium',sans-serif] font-medium leading-[9px] not-italic relative shrink-0 text-[9px] text-black tracking-[-0.18px] whitespace-nowrap">
            My Skills
          </p>
          <div className="content-stretch flex flex-col gap-[5px] items-start justify-center relative shrink-0 w-full">
            {effectiveTailoredContent.skillGroups.map((group) => (
              <div key={group.category} className="content-stretch flex flex-col gap-[3px] items-start justify-center relative shrink-0 w-full">
                <p className="[word-break:break-word] font-['DM_Sans:Medium',sans-serif] font-medium leading-[11px] relative shrink-0 text-[#626c85] text-[7px] whitespace-nowrap">
                  {group.category}
                </p>
                <div className="flex flex-wrap gap-[2.5px] items-start w-[144px]">
                  {group.items.map((item) => (
                    <div
                      key={item}
                      className="bg-gradient-to-b from-[rgba(5,133,192,0.16)] to-[rgba(5,133,192,0.08)] rounded-[3px] px-[3px] py-px shrink-0"
                    >
                      <p className="[word-break:break-word] font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[normal] text-[#181c29] text-[7px] whitespace-nowrap">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="skills-section">
      <Contents />
    </div>
  );
}

function Divider2() {
  return (
    <div className="h-[0.5px] overflow-clip relative shrink-0 w-full" data-name="Divider">
      <div className="absolute border-7 border-[#e2e6ee] border-solid inset-0" data-name="divider" />
    </div>
  );
}

function ContentXs() {
  return (
    <div className="content-stretch flex items-center gap-[4px] relative shrink-0 w-[147px] pt-[2px]" data-name="content-xs">
      <span className="font-['DM_Sans:Medium',sans-serif] font-medium leading-[normal] text-[#79819a] text-[6px] tracking-[0.02px] whitespace-nowrap">
        Product Management & Strategy
      </span>
      <div className="flex-[1_0_0] h-[0.5px] bg-[#e2e6ee]" />
    </div>
  );
}

function ContentXs1() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-[147px]" data-name="content-xs">
      <a className="[word-break:break-word] block font-['DM_Sans:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#242124] text-[7px] w-full" href="https://app.uxcel.com/ux/shayanesf" style={{ fontVariationSettings: '"opsz" 14' }} target="_blank">
        <p className="cursor-pointer leading-[normal]">UXCEL Product Management</p>
      </a>
    </div>
  );
}

function ContentXs2() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-[147px]" data-name="content-xs">
      <a className="[word-break:break-word] block font-['DM_Sans:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#242124] text-[7px] w-full" href="https://www.coursera.org/account/accomplishments/specialization/WAZ53KRA37WB" style={{ fontVariationSettings: '"opsz" 14' }} target="_blank">
        <p className="cursor-pointer leading-[normal]">IBM Product Manager</p>
      </a>
    </div>
  );
}

function ContentXs3() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-[147px]" data-name="content-xs">
      <a className="[word-break:break-word] block font-['DM_Sans:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#242124] text-[7px] w-full" href="https://www.coursera.org/account/accomplishments/specialization/1PWFQDILW4LV" style={{ fontVariationSettings: '"opsz" 14' }} target="_blank">
        <p className="cursor-pointer leading-[normal]">IBM AI Product Manager</p>
      </a>
    </div>
  );
}

function ContentXs4() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-[147px]" data-name="content-xs">
      <a className="[word-break:break-word] block font-['DM_Sans:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#242124] text-[7px] w-full" href="https://credentials.edx.org/credentials/60fe0e83174049868a543fd90620343c/" style={{ fontVariationSettings: '"opsz" 14' }} target="_blank">
        <p className="cursor-pointer leading-[normal]">Product Management — University of Maryland</p>
      </a>
    </div>
  );
}

function ContentXs5() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-[147px]" data-name="content-xs">
      <a className="[word-break:break-word] block font-['DM_Sans:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#242124] text-[7px] w-full" href="https://www.coursera.org/account/accomplishments/specialization/ZWNHGQWJ6PEF" style={{ fontVariationSettings: '"opsz" 14' }} target="_blank">
        <p className="cursor-pointer leading-[normal]">Software Product Management</p>
      </a>
    </div>
  );
}

function ContentXs6() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-[147px]" data-name="content-xs">
      <a className="[word-break:break-word] block font-['DM_Sans:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#242124] text-[7px] w-full" href="https://www.coursera.org/account/accomplishments/specialization/OKTPRPK1ACJS" style={{ fontVariationSettings: '"opsz" 14' }} target="_blank">
        <p className="cursor-pointer leading-[normal]">AI Product Management</p>
      </a>
    </div>
  );
}

function ContentXs7() {
  return (
    <div className="content-stretch flex items-center gap-[4px] relative shrink-0 w-[147px] pt-[2px]" data-name="content-xs">
      <span className="font-['DM_Sans:Medium',sans-serif] font-medium leading-[normal] text-[#79819a] text-[6px] tracking-[0.02px] whitespace-nowrap">
        Project & Agile Management
      </span>
      <div className="flex-[1_0_0] h-[0.5px] bg-[#e2e6ee]" />
    </div>
  );
}

function ContentXs8() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-[147px]" data-name="content-xs">
      <a className="[word-break:break-word] block font-['DM_Sans:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#242124] text-[7px] w-full" href="https://www.coursera.org/account/accomplishments/specialization/D6QCPAALARSN" style={{ fontVariationSettings: '"opsz" 14' }} target="_blank">
        <p className="cursor-pointer leading-[normal]">Google Project Management</p>
      </a>
    </div>
  );
}

function ContentXs9() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-[147px]" data-name="content-xs">
      <a className="[word-break:break-word] block font-['DM_Sans:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#242124] text-[7px] w-full" href="https://www.coursera.org/account/accomplishments/specialization/HF22A0A9N17V?utm_source=link&utm_medium=certificate&utm_content=cert_image&utm_campaign=sharing_cta&utm_product=s12n" style={{ fontVariationSettings: '"opsz" 14' }} target="_blank">
        <p className="cursor-pointer leading-[normal]">Project Management</p>
      </a>
    </div>
  );
}

function ContentXs10() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-[147px]" data-name="content-xs">
      <a className="[word-break:break-word] block font-['DM_Sans:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#242124] text-[7px] w-full" href="https://www.coursera.org/account/accomplishments/specialization/F0R7XDBR61NT" style={{ fontVariationSettings: '"opsz" 14' }} target="_blank">
        <p className="cursor-pointer leading-[normal]">AI Strategy and Project Management</p>
      </a>
    </div>
  );
}

function ContentXs11() {
  return (
    <div className="content-stretch flex items-center gap-[4px] relative shrink-0 w-[147px] pt-[2px]" data-name="content-xs">
      <span className="font-['DM_Sans:Medium',sans-serif] font-medium leading-[normal] text-[#79819a] text-[6px] tracking-[0.02px] whitespace-nowrap">
        UX & Design
      </span>
      <div className="flex-[1_0_0] h-[0.5px] bg-[#e2e6ee]" />
    </div>
  );
}

function ContentXs12() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-[147px]" data-name="content-xs">
      <a className="[word-break:break-word] block font-['DM_Sans:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#242124] text-[7px] w-full" href="https://www.coursera.org/account/accomplishments/specialization/6HA7ZJYS1FG4" style={{ fontVariationSettings: '"opsz" 14' }} target="_blank">
        <p className="cursor-pointer leading-[normal]">Microsoft UX Design</p>
      </a>
    </div>
  );
}

function ContentXs13() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-[147px]" data-name="content-xs">
      <a className="[word-break:break-word] block font-['DM_Sans:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#242124] text-[7px] w-full" href="https://www.coursera.org/account/accomplishments/specialization/ZL5R4M4FLC9T" style={{ fontVariationSettings: '"opsz" 14' }} target="_blank">
        <p className="cursor-pointer leading-[normal]">Google UX Design</p>
      </a>
    </div>
  );
}

function ContentXs14() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-[147px]" data-name="content-xs">
      <a className="[word-break:break-word] block font-['DM_Sans:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#242124] text-[7px] w-full" href="https://www.coursera.org/account/accomplishments/specialization/RSG720PJB84P" style={{ fontVariationSettings: '"opsz" 14' }} target="_blank">
        <p className="cursor-pointer leading-[normal]">User Interface Design</p>
      </a>
    </div>
  );
}

function ContentXs15() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-[147px]" data-name="content-xs">
      <a className="[word-break:break-word] block font-['DM_Sans:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#242124] text-[7px] w-full" href="https://www.coursera.org/account/accomplishments/specialization/S8LSLVED9JDK" style={{ fontVariationSettings: '"opsz" 14' }} target="_blank">
        <p className="cursor-pointer leading-[normal]">Gamification</p>
      </a>
    </div>
  );
}

function ContentXs16() {
  return (
    <div className="content-stretch flex items-center gap-[4px] relative shrink-0 w-[147px] pt-[2px]" data-name="content-xs">
      <span className="font-['DM_Sans:Medium',sans-serif] font-medium leading-[normal] text-[#79819a] text-[6px] tracking-[0.02px] whitespace-nowrap">
        Front-End Development & Technical Skills
      </span>
      <div className="flex-[1_0_0] h-[0.5px] bg-[#e2e6ee]" />
    </div>
  );
}

function ContentXs17() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-[147px]" data-name="content-xs">
      <a className="[word-break:break-word] block font-['DM_Sans:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#242124] text-[7px] w-full" href="https://www.coursera.org/account/accomplishments/specialization/TXTAF8SCN5BD" style={{ fontVariationSettings: '"opsz" 14' }} target="_blank">
        <p className="cursor-pointer leading-[normal]">{`IBM Front-End `}</p>
      </a>
    </div>
  );
}

function ContentXs18() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-[147px]" data-name="content-xs">
      <a className="[word-break:break-word] block font-['DM_Sans:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#242124] text-[7px] w-full" href="https://www.coursera.org/account/accomplishments/specialization/GF67W73QMAZF" style={{ fontVariationSettings: '"opsz" 14' }} target="_blank">
        <p className="cursor-pointer leading-[normal]">{`Meta Front-End `}</p>
      </a>
    </div>
  );
}

function ContentXs19() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-[147px]" data-name="content-xs">
      <a className="[word-break:break-word] block font-['DM_Sans:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#242124] text-[7px] w-full" href="https://www.coursera.org/account/accomplishments/specialization/VFX4VRUQSTRC" style={{ fontVariationSettings: '"opsz" 14' }} target="_blank">
        <p className="cursor-pointer leading-[normal]">Microsoft Front-End Developer</p>
      </a>
    </div>
  );
}

function ContentXs20() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-[147px]" data-name="content-xs">
      <a className="[word-break:break-word] block font-['DM_Sans:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#242124] text-[7px] w-full" href="https://www.coursera.org/account/accomplishments/specialization/P9TG58LPC5TE" style={{ fontVariationSettings: '"opsz" 14' }} target="_blank">
        <p className="cursor-pointer leading-[normal]">Data Structures and Algorithms</p>
      </a>
    </div>
  );
}

function Content1() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[4px] items-start ml-0 mt-[23px] relative row-1" data-name="content">
      <ContentXs />
      <a className="[word-break:break-word] block font-['DM_Sans:Regular',sans-serif] font-normal h-[9px] leading-[0] relative shrink-0 text-[#242124] text-[7px] w-[147px]" href="https://www.coursera.org/account/accomplishments/specialization/XGF7N6J2LI3F" style={{ fontVariationSettings: '"opsz" 14' }} target="_blank">
        <p className="cursor-pointer leading-[normal]">{`Microsoft Project Management `}</p>
      </a>
      <ContentXs1 />
      <ContentXs2 />
      <ContentXs3 />
      <ContentXs4 />
      <ContentXs5 />
      <ContentXs6 />
      <ContentXs7 />
      <ContentXs8 />
      <ContentXs9 />
      <ContentXs10 />
      <ContentXs11 />
      <ContentXs12 />
      <ContentXs13 />
      <ContentXs14 />
      <ContentXs15 />
      <ContentXs16 />
      <ContentXs17 />
      <ContentXs18 />
      <ContentXs19 />
      <ContentXs20 />
    </div>
  );
}

function Title() {
  return (
    <div className="col-1 content-stretch flex items-start ml-0 mt-0 relative row-1 w-[144px]" data-name="title">
      <p className="[word-break:break-word] capitalize font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[10px] text-black whitespace-nowrap">Certifications</p>
    </div>
  );
}

function Group3() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <Content1 />
      <Title />
    </div>
  );
}

function Divider3() {
  return (
    <div className="h-[0.5px] overflow-clip relative shrink-0 w-full" data-name="Divider">
      <div className="absolute border-7 border-[#e2e6ee] border-solid inset-0" data-name="divider" />
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0 size-[6px]" data-name="Frame">
      <svg className="absolute block inset-0 size-full" fill="none" height="6" preserveAspectRatio="none" viewBox="0 0 6 6" width="6">
        <g id="Frame">
          <path d={svgPaths.p2268e00} fill="black" id="Vector" opacity="0.4" />
          <path d={svgPaths.p1bb12880} id="Vector_2" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
          <path d="M5.5 3.6875H4.875" id="Vector_3" stroke="black" strokeLinecap="round" strokeWidth="0.375" />
          <path d="M2.125 1.68751H0.5" id="Vector_4" stroke="black" strokeLinecap="round" strokeWidth="0.375" />
        </g>
      </svg>
    </div>
  );
}

function Location() {
  return (
    <div className="content-stretch flex gap-[2px] items-center justify-center py-px relative shrink-0" data-name="Location">
      <Frame />
      <div className="[word-break:break-word] flex flex-col font-['DM_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#79819a] text-[7px] whitespace-nowrap">
        <p className="leading-[11px]">Program Collaborator</p>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="relative shrink-0 size-[6px]" data-name="Frame">
      <svg className="absolute block inset-0 size-full" fill="none" height="6" preserveAspectRatio="none" viewBox="0 0 6 6" width="6">
        <g clipPath="url(#clip0_0_109)" id="Frame">
          <path d={svgPaths.p21335c00} fill="#141B34" id="Vector" opacity="0.4" />
          <path d="M4 0.5V1.5M2 0.5V1.5" id="Vector_2" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
          <path d={svgPaths.p2bb74180} id="Vector_3" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
          <path d="M0.75 2.5H5.25" id="Vector_4" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
          <path d={svgPaths.p3ff28c20} id="Vector_5" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
        </g>
        <defs>
          <clipPath id="clip0_0_109">
            <rect fill="white" height="6" width="6" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Location1() {
  return (
    <div className="content-stretch flex gap-[2px] h-full items-center relative shrink-0" data-name="Location">
      <Frame1 />
      <div className="[word-break:break-word] flex flex-col font-['DM_Sans:ExtraLight',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#47516b] text-[6px] whitespace-nowrap">
        <p className="leading-[11px]">Aug 2025</p>
      </div>
    </div>
  );
}

function DateAndPlace() {
  return (
    <div className="content-stretch flex h-[9px] items-center justify-between relative shrink-0 w-full" data-name="Date and place">
      <Location />
      <Location1 />
    </div>
  );
}

function Content3() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Content">
      <div className="[word-break:break-word] flex flex-col font-['DM_Sans:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#2e2e48] text-[7.5px] whitespace-nowrap">
        <p className="leading-[11px]">{`"Hamsaz" Accelerator & Bootcamp (MCl)`}</p>
      </div>
      <DateAndPlace />
    </div>
  );
}

function Frame2() {
  return (
    <div className="relative shrink-0 size-[6px]" data-name="Frame">
      <svg className="absolute block inset-0 size-full" fill="none" height="6" preserveAspectRatio="none" viewBox="0 0 6 6" width="6">
        <g id="Frame">
          <path d={svgPaths.p2268e00} fill="black" id="Vector" opacity="0.4" />
          <path d={svgPaths.p1bb12880} id="Vector_2" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
          <path d="M5.5 3.6875H4.875" id="Vector_3" stroke="black" strokeLinecap="round" strokeWidth="0.375" />
          <path d="M2.125 1.68751H0.5" id="Vector_4" stroke="black" strokeLinecap="round" strokeWidth="0.375" />
        </g>
      </svg>
    </div>
  );
}

function Location2() {
  return (
    <div className="content-stretch flex gap-[2px] items-center justify-center py-px relative shrink-0" data-name="Location">
      <Frame2 />
      <div className="[word-break:break-word] flex flex-col font-['DM_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#79819a] text-[7px] whitespace-nowrap">
        <p className="leading-[11px]">Collaborator</p>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="relative shrink-0 size-[6px]" data-name="Frame">
      <svg className="absolute block inset-0 size-full" fill="none" height="6" preserveAspectRatio="none" viewBox="0 0 6 6" width="6">
        <g clipPath="url(#clip0_0_109)" id="Frame">
          <path d={svgPaths.p21335c00} fill="#141B34" id="Vector" opacity="0.4" />
          <path d="M4 0.5V1.5M2 0.5V1.5" id="Vector_2" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
          <path d={svgPaths.p2bb74180} id="Vector_3" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
          <path d="M0.75 2.5H5.25" id="Vector_4" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
          <path d={svgPaths.p3ff28c20} id="Vector_5" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
        </g>
        <defs>
          <clipPath id="clip0_0_109">
            <rect fill="white" height="6" width="6" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Location3() {
  return (
    <div className="content-stretch flex gap-[2px] h-full items-center relative shrink-0" data-name="Location">
      <Frame3 />
      <div className="[word-break:break-word] flex flex-col font-['DM_Sans:ExtraLight',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#47516b] text-[6px] whitespace-nowrap">
        <p className="leading-[11px]">Jan 2026 – Present</p>
      </div>
    </div>
  );
}

function DateAndPlace1() {
  return (
    <div className="content-stretch flex h-[9px] items-center justify-between relative shrink-0 w-full" data-name="Date and place">
      <Location2 />
      <Location3 />
    </div>
  );
}

function Content4() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Content">
      <div className="[word-break:break-word] flex flex-col font-['DM_Sans:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#2e2e48] text-[7.5px] whitespace-nowrap">
        <p className="leading-[11px]">MCI Startup Studio</p>
      </div>
      <DateAndPlace1 />
    </div>
  );
}

function Frame4() {
  return (
    <div className="relative shrink-0 size-[6px]" data-name="Frame">
      <svg className="absolute block inset-0 size-full" fill="none" height="6" preserveAspectRatio="none" viewBox="0 0 6 6" width="6">
        <g id="Frame">
          <path d={svgPaths.p767380} fill="#141B34" id="Vector" opacity="0.4" stroke="#141B34" strokeLinejoin="round" strokeWidth="0.375" />
          <path d={svgPaths.p767380} id="Vector_2" stroke="#141B34" strokeLinejoin="round" strokeWidth="0.375" />
          <path d={svgPaths.p2cb46600} id="Vector_3" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
          <path d={svgPaths.p16963cd0} id="Vector_4" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
        </g>
      </svg>
    </div>
  );
}

function Location4() {
  return (
    <div className="content-stretch flex gap-[2px] items-center justify-center py-px relative shrink-0" data-name="Location">
      <Frame4 />
      <div className="[word-break:break-word] flex flex-col font-['DM_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#79819a] text-[7px] whitespace-nowrap">
        <p className="leading-[10px]">{`Award Winner `}</p>
      </div>
    </div>
  );
}

function Frame5() {
  return (
    <div className="relative shrink-0 size-[6px]" data-name="Frame">
      <svg className="absolute block inset-0 size-full" fill="none" height="6" preserveAspectRatio="none" viewBox="0 0 6 6" width="6">
        <g clipPath="url(#clip0_0_109)" id="Frame">
          <path d={svgPaths.p21335c00} fill="#141B34" id="Vector" opacity="0.4" />
          <path d="M4 0.5V1.5M2 0.5V1.5" id="Vector_2" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
          <path d={svgPaths.p2bb74180} id="Vector_3" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
          <path d="M0.75 2.5H5.25" id="Vector_4" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
          <path d={svgPaths.p3ff28c20} id="Vector_5" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
        </g>
        <defs>
          <clipPath id="clip0_0_109">
            <rect fill="white" height="6" width="6" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Location5() {
  return (
    <div className="content-stretch flex gap-[2px] h-full items-center relative shrink-0" data-name="Location">
      <Frame5 />
      <div className="[word-break:break-word] flex flex-col font-['DM_Sans:ExtraLight',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#47516b] text-[6px] tracking-[0.06px] whitespace-nowrap">
        <p className="leading-[normal]">December 2025</p>
      </div>
    </div>
  );
}

function DateAndPlace2() {
  return (
    <div className="content-stretch flex h-[9px] items-center justify-between relative shrink-0 w-full" data-name="Date and place">
      <Location4 />
      <Location5 />
    </div>
  );
}

function Content5() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Content">
      <div className="[word-break:break-word] flex flex-col font-['DM_Sans:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#2e2e48] text-[7.5px] tracking-[0.08px] whitespace-nowrap">
        <p className="leading-[8px]">Sepino2 Investment event</p>
      </div>
      <DateAndPlace2 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="absolute left-0 size-[6px] top-[1.5px]" data-name="Frame">
      <svg className="absolute block inset-0 size-full" fill="none" height="6" preserveAspectRatio="none" viewBox="0 0 6 6" width="6">
        <g id="Frame">
          <path d={svgPaths.p2268e00} fill="black" id="Vector" opacity="0.4" />
          <path d={svgPaths.p1bb12880} id="Vector_2" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
          <path d="M5.5 3.6875H4.875" id="Vector_3" stroke="black" strokeLinecap="round" strokeWidth="0.375" />
          <path d="M2.125 1.68751H0.5" id="Vector_4" stroke="black" strokeLinecap="round" strokeWidth="0.375" />
        </g>
      </svg>
    </div>
  );
}

function Location6() {
  return (
    <div className="h-[9px] relative shrink-0 w-[39px]" data-name="Location">
      <Frame6 />
      <p className="[word-break:break-word] absolute font-['DM_Sans:Regular',sans-serif] leading-[10px] left-[8px] not-italic text-[#79819a] text-[7px] top-0 whitespace-nowrap">Product Presenter</p>
    </div>
  );
}

function Frame7() {
  return (
    <div className="relative shrink-0 size-[6px]" data-name="Frame">
      <svg className="absolute block inset-0 size-full" fill="none" height="6" preserveAspectRatio="none" viewBox="0 0 6 6" width="6">
        <g clipPath="url(#clip0_0_109)" id="Frame">
          <path d={svgPaths.p21335c00} fill="#141B34" id="Vector" opacity="0.4" />
          <path d="M4 0.5V1.5M2 0.5V1.5" id="Vector_2" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
          <path d={svgPaths.p2bb74180} id="Vector_3" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
          <path d="M0.75 2.5H5.25" id="Vector_4" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
          <path d={svgPaths.p3ff28c20} id="Vector_5" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
        </g>
        <defs>
          <clipPath id="clip0_0_109">
            <rect fill="white" height="6" width="6" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Location7() {
  return (
    <div className="content-stretch flex gap-[2px] h-full items-center relative shrink-0" data-name="Location">
      <Frame7 />
      <div className="[word-break:break-word] flex flex-col font-['DM_Sans:ExtraLight',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#47516b] text-[6px] tracking-[0.06px] whitespace-nowrap">
        <p className="leading-[normal]">September 2025</p>
      </div>
    </div>
  );
}

function DateAndPlace3() {
  return (
    <div className="content-stretch flex h-[9px] items-center justify-between relative shrink-0 w-full" data-name="Date and place">
      <Location6 />
      <Location7 />
    </div>
  );
}

function Content6() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Content">
      <div className="[word-break:break-word] flex flex-col font-['DM_Sans:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#2e2e48] text-[7.5px] tracking-[0.08px] whitespace-nowrap">
        <p className="leading-[8px]">{` Iran Elecomp 2025`}</p>
      </div>
      <DateAndPlace3 />
    </div>
  );
}

function Frame8() {
  return (
    <div className="relative shrink-0 size-[6px]" data-name="Frame">
      <svg className="absolute block inset-0 size-full" fill="none" height="6" preserveAspectRatio="none" viewBox="0 0 6 6" width="6">
        <g id="Frame">
          <path d={svgPaths.p767380} fill="#141B34" id="Vector" opacity="0.4" stroke="#141B34" strokeLinejoin="round" strokeWidth="0.375" />
          <path d={svgPaths.p767380} id="Vector_2" stroke="#141B34" strokeLinejoin="round" strokeWidth="0.375" />
          <path d={svgPaths.p2cb46600} id="Vector_3" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
          <path d={svgPaths.p16963cd0} id="Vector_4" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
        </g>
      </svg>
    </div>
  );
}

function Location8() {
  return (
    <div className="content-stretch flex gap-[2px] items-center justify-center py-px relative shrink-0" data-name="Location">
      <Frame8 />
      <div className="[word-break:break-word] flex flex-col font-['DM_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#79819a] text-[7px] whitespace-nowrap">
        <p className="leading-[10px]">{`Award Winner `}</p>
      </div>
    </div>
  );
}

function Frame9() {
  return (
    <div className="relative shrink-0 size-[6px]" data-name="Frame">
      <svg className="absolute block inset-0 size-full" fill="none" height="6" preserveAspectRatio="none" viewBox="0 0 6 6" width="6">
        <g clipPath="url(#clip0_0_109)" id="Frame">
          <path d={svgPaths.p21335c00} fill="#141B34" id="Vector" opacity="0.4" />
          <path d="M4 0.5V1.5M2 0.5V1.5" id="Vector_2" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
          <path d={svgPaths.p2bb74180} id="Vector_3" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
          <path d="M0.75 2.5H5.25" id="Vector_4" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
          <path d={svgPaths.p3ff28c20} id="Vector_5" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
        </g>
        <defs>
          <clipPath id="clip0_0_109">
            <rect fill="white" height="6" width="6" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Location9() {
  return (
    <div className="content-stretch flex gap-[2px] h-full items-center relative shrink-0" data-name="Location">
      <Frame9 />
      <div className="[word-break:break-word] flex flex-col font-['DM_Sans:ExtraLight',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#47516b] text-[6px] tracking-[0.06px] whitespace-nowrap">
        <p className="leading-[normal]">February 2025</p>
      </div>
    </div>
  );
}

function DateAndPlace4() {
  return (
    <div className="content-stretch flex h-[9px] items-center justify-between relative shrink-0 w-full" data-name="Date and place">
      <Location8 />
      <Location9 />
    </div>
  );
}

function Content7() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start min-w-px relative" data-name="Content">
      <div className="[word-break:break-word] flex flex-col font-['DM_Sans:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#2e2e48] text-[7.5px] tracking-[0.08px] whitespace-nowrap">
        <p className="leading-[8px]">6th Intl. Mobile Health Congress</p>
      </div>
      <DateAndPlace4 />
    </div>
  );
}

function CompanyAndRole() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Company and role">
      <Content7 />
    </div>
  );
}

function Frame10() {
  return (
    <div className="absolute left-0 size-[6px] top-[1.5px]" data-name="Frame">
      <svg className="absolute block inset-0 size-full" fill="none" height="6" preserveAspectRatio="none" viewBox="0 0 6 6" width="6">
        <g id="Frame">
          <path d={svgPaths.p2268e00} fill="black" id="Vector" opacity="0.4" />
          <path d={svgPaths.p1bb12880} id="Vector_2" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
          <path d="M5.5 3.6875H4.875" id="Vector_3" stroke="black" strokeLinecap="round" strokeWidth="0.375" />
          <path d="M2.125 1.68751H0.5" id="Vector_4" stroke="black" strokeLinecap="round" strokeWidth="0.375" />
        </g>
      </svg>
    </div>
  );
}

function Location10() {
  return (
    <div className="h-[9px] relative shrink-0 w-[39px]" data-name="Location">
      <Frame10 />
      <p className="[word-break:break-word] absolute font-['DM_Sans:Regular',sans-serif] leading-[10px] left-[8px] not-italic text-[#79819a] text-[7px] top-0 whitespace-nowrap">Product Presenter</p>
    </div>
  );
}

function Frame11() {
  return (
    <div className="relative shrink-0 size-[6px]" data-name="Frame">
      <svg className="absolute block inset-0 size-full" fill="none" height="6" preserveAspectRatio="none" viewBox="0 0 6 6" width="6">
        <g clipPath="url(#clip0_0_109)" id="Frame">
          <path d={svgPaths.p21335c00} fill="#141B34" id="Vector" opacity="0.4" />
          <path d="M4 0.5V1.5M2 0.5V1.5" id="Vector_2" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
          <path d={svgPaths.p2bb74180} id="Vector_3" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
          <path d="M0.75 2.5H5.25" id="Vector_4" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
          <path d={svgPaths.p3ff28c20} id="Vector_5" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
        </g>
        <defs>
          <clipPath id="clip0_0_109">
            <rect fill="white" height="6" width="6" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Location11() {
  return (
    <div className="content-stretch flex gap-[2px] h-full items-center relative shrink-0" data-name="Location">
      <Frame11 />
      <div className="[word-break:break-word] flex flex-col font-['DM_Sans:ExtraLight',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#47516b] text-[6px] tracking-[0.06px] whitespace-nowrap">
        <p className="leading-[normal]">December 2024</p>
      </div>
    </div>
  );
}

function DateAndPlace5() {
  return (
    <div className="content-stretch flex h-[9px] items-center justify-between relative shrink-0 w-full" data-name="Date and place">
      <Location10 />
      <Location11 />
    </div>
  );
}

function Content8() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Content">
      <div className="[word-break:break-word] flex flex-col font-['DM_Sans:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#2e2e48] text-[7.5px] tracking-[0.08px] whitespace-nowrap">
        <p className="leading-[8px]">{` Iran Telecom 2024`}</p>
      </div>
      <DateAndPlace5 />
    </div>
  );
}

function Frame12() {
  return (
    <div className="relative shrink-0 size-[6px]" data-name="Frame">
      <svg className="absolute block inset-0 size-full" fill="none" height="6" preserveAspectRatio="none" viewBox="0 0 6 6" width="6">
        <g id="Frame">
          <path d={svgPaths.p2268e00} fill="black" id="Vector" opacity="0.4" />
          <path d={svgPaths.p1bb12880} id="Vector_2" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
          <path d="M5.5 3.6875H4.875" id="Vector_3" stroke="black" strokeLinecap="round" strokeWidth="0.375" />
          <path d="M2.125 1.68751H0.5" id="Vector_4" stroke="black" strokeLinecap="round" strokeWidth="0.375" />
        </g>
      </svg>
    </div>
  );
}

function Location12() {
  return (
    <div className="content-stretch flex gap-[2px] h-[9px] items-center relative shrink-0" data-name="Location">
      <Frame12 />
      <div className="[word-break:break-word] flex flex-col font-['DM_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#79819a] text-[7px] whitespace-nowrap">
        <p className="leading-[10px]">Collaboration</p>
      </div>
    </div>
  );
}

function Frame13() {
  return (
    <div className="relative shrink-0 size-[6px]" data-name="Frame">
      <svg className="absolute block inset-0 size-full" fill="none" height="6" preserveAspectRatio="none" viewBox="0 0 6 6" width="6">
        <g clipPath="url(#clip0_0_109)" id="Frame">
          <path d={svgPaths.p21335c00} fill="#141B34" id="Vector" opacity="0.4" />
          <path d="M4 0.5V1.5M2 0.5V1.5" id="Vector_2" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
          <path d={svgPaths.p2bb74180} id="Vector_3" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
          <path d="M0.75 2.5H5.25" id="Vector_4" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.375" />
          <path d={svgPaths.p3ff28c20} id="Vector_5" stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
        </g>
        <defs>
          <clipPath id="clip0_0_109">
            <rect fill="white" height="6" width="6" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Location13() {
  return (
    <div className="content-stretch flex gap-[2px] h-[9px] items-center relative shrink-0" data-name="Location">
      <Frame13 />
      <div className="[word-break:break-word] flex flex-col font-['DM_Sans:ExtraLight',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#47516b] text-[6px] tracking-[0.06px] whitespace-nowrap">
        <p className="leading-[normal]">2023–2024</p>
      </div>
    </div>
  );
}

function DateAndPlace6() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Date and place">
      <Location12 />
      <Location13 />
    </div>
  );
}

function Content9() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Content">
      <div className="[word-break:break-word] flex flex-col font-['DM_Sans:Medium',sans-serif] font-medium h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#2e2e48] text-[7.5px] tracking-[0.08px] w-full">
        <p className="leading-[10px]">Innovation Collaboration — SRB IAU Technology Park</p>
      </div>
      <DateAndPlace6 />
    </div>
  );
}

function Content2() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[4px] items-start ml-0 mt-[21px] relative row-1 w-[135px]" data-name="content">
      <Content3 />
      <Content4 />
      <Content5 />
      <Content6 />
      <CompanyAndRole />
      <Content8 />
      <Content9 />
    </div>
  );
}

function Title1() {
  return (
    <div className="col-1 content-stretch flex h-[10px] items-start ml-0 mt-0 relative row-1 w-[144px]" data-name="title">
      <div className="[word-break:break-word] capitalize font-['Outfit:Medium',sans-serif] font-medium h-[10px] leading-[0] relative shrink-0 text-[10px] text-black w-[136px]">
        <p className="leading-[normal] mb-0">{`Awards & Industry Recognition`}</p>
        <p className="leading-[normal]">​</p>
      </div>
    </div>
  );
}

function Group4() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <Content2 />
      <Title1 />
    </div>
  );
}

function Divider4() {
  return (
    <div className="h-[0.5px] overflow-clip relative shrink-0 w-full" data-name="Divider">
      <div className="absolute border-7 border-[#e2e6ee] border-solid inset-0" data-name="divider" />
    </div>
  );
}

function Text5() {
  const { data } = useResume();
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[2px] items-start min-w-px relative text-[#47516b]" data-name="Text">
      <p className="font-['DM_Sans:Regular',sans-serif] font-normal leading-[8px] relative shrink-0 text-[6px] tracking-[0.06px] w-full" style={{ fontVariationSettings: '"opsz" 14' }}>
        Favourite Quote:
      </p>
      <p className="font-['DM_Sans:Medium',sans-serif] font-medium leading-[11px] relative shrink-0 text-[9px] w-full" style={{ fontVariationSettings: '"opsz" 14' }}>
        {data.profile.quote || "“The best way to predict the future is to create it.” - Peter Drucker"}
      </p>
    </div>
  );
}

function Row5() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Row">
      <Text5 />
    </div>
  );
}

function WeightedAboutText({ text }: { text: string }) {
  const phrasesToWeight = [
    "Product Manager",
    "front-end engineering",
    "AI-driven products",
    "Product Discovery",
    "Root Cause Analysis",
    "JTBD framework",
    "Delband digital health platform",
    "Delband",
    "Medicine 3.0",
    '"Knowledge-Based" company',
    "two funding rounds",
    "strategic acquisition by MCI",
    "acquisition by MCI",
    "Mobarakeh Steel Group",
    "Presidential Innovation Fund",
    "6th International Digital Health Congress",
  ];

  const regex = new RegExp(`(\\*\\*.*?\\*\\*|${phrasesToWeight.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  const parts = text.split(regex);

  return (
    <p className="[word-break:break-word] font-['Plus_Jakarta_Sans',sans-serif] font-normal leading-[11px] min-w-full not-italic relative shrink-0 text-[#334155] text-[7px] tracking-[-0.02px] w-full text-justify">
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-bold text-[#0f172a]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (phrasesToWeight.includes(part)) {
          return (
            <strong key={i} className="font-bold text-[#0f172a]">
              {part}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

function Container() {
  const { data, effectiveTailoredContent } = useResume();
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start pb-[5px] pt-[10px] px-[16px] relative w-[176px]" data-name="Container">
      <Header />
      <WeightedAboutText text={effectiveTailoredContent ? effectiveTailoredContent.summary : data.profile.about} />
      <Infos />
      <Divider1 />
      <SkillsSection />
      <Divider2 />
      <Group3 />
      <Divider3 />
      <Group4 />
      <Divider4 />
      <Row5 />
    </div>
  );
}

function Aside() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start relative shrink-0 w-[176px] self-stretch" data-name="Aside">
      <Container />
    </div>
  );
}

function MiscDot04L() {
  return (
    <div className="absolute inset-[18.75%]" data-name="misc/dot_04_l">
      <svg className="absolute block inset-0 size-full" fill="none" height="7.5" preserveAspectRatio="none" viewBox="0 0 7.5 7.5" width="7.5">
        <g id="misc/dot_04_l">
          <path d={svgPaths.p224b5900} fill="#2E2E48" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function StepIconBase() {
  return (
    <div className="overflow-clip relative rounded-[100px] shrink-0 size-[12px]" data-name="_Step icon base">
      <MiscDot04L />
    </div>
  );
}

function Divider5() {
  return <div className="flex-[1_0_0] min-h-px relative w-[0.5px]" data-name="Divider" />;
}

function StepIconWrap() {
  return (
    <div className="content-stretch flex flex-col items-center relative self-stretch shrink-0 w-[12px] pt-[2px]" data-name="Step icon wrap">
      <StepIconBase />
      <div className="w-[1.5px] flex-1 bg-gradient-to-b from-[#0284c7] via-[#94a3b8] to-[#cbd5e1] rounded-full my-[2px] min-h-[20px] shrink-0" data-name="Divider" />
    </div>
  );
}

function Frame14() {
  return (
    <div className="flex flex-col justify-center min-w-0 flex-[1_0_0] gap-[1px]">
      <p className="font-['Outfit',sans-serif] font-bold text-[#0f172a] text-[10px] leading-tight tracking-[-0.01em] whitespace-nowrap truncate">
        Technology & Product Advisor | Mentor Bootcamp
      </p>
      <p className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[#475569] text-[7.5px] leading-tight" dir="auto">
        TUMS Health Innoversity
      </p>
    </div>
  );
}

function BasicLocation() {
  return (
    <div className="relative shrink-0 size-[7px]" data-name="basic/location">
      <svg className="absolute block inset-0 size-full" fill="none" height="7" preserveAspectRatio="none" viewBox="0 0 6 6" width="7">
        <g id="basic/location">
          <path d={svgPaths.p313fd580} fill="#64748B" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Location14() {
  return (
    <div className="content-stretch flex gap-[2px] items-center relative shrink-0" data-name="Location">
      <BasicLocation />
      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[#64748b] text-[7px] tracking-[0.02px] whitespace-nowrap">
        Iran · Advisory
      </span>
    </div>
  );
}

function DateAndPlace7() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-end relative shrink-0" data-name="Date and place">
      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[#64748b] text-[7px] tracking-[0.02px] whitespace-nowrap">
        Jul 2026 - Present
      </span>
      <Location14 />
    </div>
  );
}

function TopBar() {
  return (
    <div className="content-stretch flex gap-[5px] items-center justify-between relative shrink-0 w-full min-h-[24px]" data-name="Top Bar">
      <div className="flex items-center gap-[5px] min-w-0 flex-[1_0_0]">
        <div className="h-[22px] relative shrink-0 w-[20px]" data-name="image-removebg-preview 1">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img alt="" className="absolute h-[109.61%] left-[-6.37%] max-w-none top-[-5.9%] w-[117.22%]" src={imgImageRemovebgPreview1} />
          </div>
        </div>
        <Frame14 />
      </div>
      <DateAndPlace7 />
    </div>
  );
}

function DescriptionWithTags() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[360px]" data-name="Description with Tags">
      <div className="[word-break:break-word] font-['Plus_Jakarta_Sans',sans-serif] font-normal leading-[13.5px] relative shrink-0 text-[#334155] text-[8.35px] w-[360px]">
        <p className="mb-[2px] whitespace-pre-wrap" dir="auto">
          <span className="font-medium text-[#334155]">{`Bridging clinical challenges and multidisciplinary tech solutions; mentor in `}</span>
          <span className="font-bold text-[#0f172a]">{`Iran's first clinical innovation bootcamp`}</span>
        </p>
        <ul className="leading-[11px] list-disc space-y-[2px]">
          <li className="mb-0 ms-[12px]">
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{`Analytical Problem-Solving & Design Thinking`}</span>
            <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{` — `}</span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{`Facilitated a `}</span>
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>
              5-month clinical innovation program
            </span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{` applying Design Thinking and divergent/convergent thinking frameworks; trained clinical teams in `}</span>
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{`structured problem-solving`}</span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{`, stakeholder persuasion, and defending their proposals.`}</span>
          </li>
          <li className="mb-0 ms-[12px]">
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{`Eldercare Team Mentorship & Execution`}</span>
            <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{` — `}</span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{`Guided the eldercare team end-to-end from `}</span>
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>
              team formation to product implementation
            </span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{` and `}</span>
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{`fundraising readiness`}</span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{`.`}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function QuixelExperience() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Quixel Experience">
      <TopBar />
      <DescriptionWithTags />
    </div>
  );
}

function Frame26() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[361px]">
      <QuixelExperience />
    </div>
  );
}

function Component() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[362px]" data-name="افق داده">
      <Frame26 />
    </div>
  );
}

function Content12() {
  return (
    <div className="content-stretch flex items-start pt-[2px] relative shrink-0 w-[361px]" data-name="Content">
      <Component />
    </div>
  );
}

function Experience() {
  return (
    <div className="content-stretch flex gap-[5px] items-stretch justify-between relative shrink-0 w-full" data-name="Experience">
      <StepIconWrap />
      <Content12 />
    </div>
  );
}

function MiscDot04L1() {
  return (
    <div className="absolute inset-[18.75%]" data-name="misc/dot_04_l">
      <svg className="absolute block inset-0 size-full" fill="none" height="7.5" preserveAspectRatio="none" viewBox="0 0 7.5 7.5" width="7.5">
        <g id="misc/dot_04_l">
          <path d={svgPaths.p224b5900} fill="#2E2E48" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function StepIconBase1() {
  return (
    <div className="overflow-clip relative rounded-[100px] shrink-0 size-[12px]" data-name="_Step icon base">
      <MiscDot04L1 />
    </div>
  );
}

function Divider6() {
  return (
    <div className="flex-[1_0_0] min-h-px overflow-clip relative rounded-[2px] w-[0.5px]" data-name="Divider">
      <div className="absolute border border-[#e2e6ee] border-solid inset-0" data-name="divider" />
    </div>
  );
}

function StepIconWrap1() {
  return (
    <div className="content-stretch flex flex-col items-center mr-[-1px] relative self-stretch shrink-0 w-[12px] pt-[2px]" data-name="Step icon wrap">
      <StepIconBase1 />
      <div className="w-[1.5px] flex-1 bg-gradient-to-b from-[#0284c7] via-[#94a3b8] to-[#cbd5e1] rounded-full my-[2px] min-h-[20px] shrink-0" data-name="Divider" />
    </div>
  );
}

function Frame15() {
  return (
    <div className="flex flex-col justify-center min-w-0 flex-[1_0_0] gap-[1px]">
      <p className="font-['Outfit',sans-serif] font-bold text-[#0f172a] text-[10px] leading-tight tracking-[-0.01em] whitespace-nowrap truncate">
        Technical Product Manager
      </p>
      <a className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[#475569] text-[7.5px] leading-tight hover:text-[#0284c7] transition-colors" href="https://delbandcare.com/" target="_blank">
        <p dir="auto">
          Hamrahe Aval (MCI)
        </p>
      </a>
    </div>
  );
}

function BasicLocation1() {
  return (
    <div className="relative shrink-0 size-[7px]" data-name="basic/location">
      <svg className="absolute block inset-0 size-full" fill="none" height="7" preserveAspectRatio="none" viewBox="0 0 6 6" width="7">
        <g id="basic/location">
          <path d={svgPaths.p364dd000} fill="#64748B" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Location15() {
  return (
    <div className="content-stretch flex gap-[2px] items-center relative shrink-0" data-name="Location">
      <BasicLocation1 />
      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[#64748b] text-[7px] tracking-[0.02px] whitespace-nowrap">
        Tehran, Iran · Full-time
      </span>
    </div>
  );
}

function DateAndPlace8() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-end relative shrink-0" data-name="Date and place">
      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[#64748b] text-[7px] tracking-[0.02px] whitespace-nowrap">
        Apr 2025 - Present
      </span>
      <Location15 />
    </div>
  );
}

function TopBar1() {
  return (
    <div className="content-stretch flex gap-[5px] items-center justify-between relative shrink-0 w-full min-h-[24px]" data-name="Top Bar">
      <div className="flex items-center gap-[5px] min-w-0 flex-[1_0_0]">
        <div className="h-[19px] relative shrink-0 w-[30px]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" height="19" preserveAspectRatio="none" viewBox="0 0 30 19" width="30">
            <path d={svgPaths.p2cbcf800} fill="#0095DA" id="Vector" />
          </svg>
        </div>
        <Frame15 />
      </div>
      <DateAndPlace8 />
    </div>
  );
}

function DescriptionWithTags1() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[360px]" data-name="Description with Tags">
      <div className="[word-break:break-word] font-['Plus_Jakarta_Sans',sans-serif] leading-[13.5px] not-italic relative shrink-0 text-[#334155] text-[8.35px] w-[360px]">
        <p className="mb-[2px]">
          <span className="font-normal text-[#334155]">{`Led the delivery of the `}</span>
          <span className="font-bold text-[#0f172a]">
            first native Med 3.0 digital health
          </span>
          <span className="font-normal text-[#334155]">{` service in Iran by aligning business strategy, user value, and economic impact, and orchestrating cross-functional product, engineering, and stakeholder teams.`}</span>
        </p>
        <ul className="leading-[11px] list-disc space-y-[2px]">
          <li className="mb-0 ms-[12px]">
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{`B2B Enterprise Pivot`}</span>
            <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{` — `}</span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{`Led the strategic pivot into corporate wellness by launching an `}</span>
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>
              enterprise digital health dashboard
            </span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{`; opened a new B2B GTM channel and secured enterprise accounts including `}</span>
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>
              Mobarakeh Steel
            </span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{` (modeled to lift business-plan IRR by `}</span>
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>
              15%
            </span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{`).`}</span>
          </li>
          <li className="mb-0 ms-[12px]">
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{`Lean Discovery & Prototyping`}</span>
            <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{` — `}</span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{`Built and shipped a standalone `}</span>
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>
              Wizard of Oz
            </span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{` prototype directly to target users without engineering overhead; killed a low-ROI workout feature using pilot validation data, saving `}</span>
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>
              5 sprints
            </span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{` and reducing GTM risk.`}</span>
          </li>
          <li className="mb-0 ms-[12px]">
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{`Delivery & Performance Systems`}</span>
            <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{` — `}</span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{`Eliminated key-person dependency by standardizing workflows, redesigning OKRs, and building a team/individual performance-tracking panel aligned with product outcomes, accelerating sprint delivery `}</span>
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>
              20% ahead of estimates
            </span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{` with zero added headcount.`}</span>
          </li>
          <li className="mb-0 ms-[12px]">
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{`Freemium Funnel, CLTV & CAC Optimization`}</span>
            <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{` — `}</span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{`Architected a personalized, `}</span>
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>
              sensor-less freemium funnel
            </span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{` tailored to distinct user segments and personas; accelerated user acquisition, improved `}</span>
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>
              activation and free-to-hardware conversion
            </span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{`, maximized `}</span>
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{`CLTV`}</span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{`, and lowered `}</span>
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{`CAC`}</span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{` by guiding free users organically toward hardware purchase and paid subscriptions.`}</span>
          </li>
          <li className="mb-0 ms-[12px]">
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{`Segmentation, Use-Case Expansion & Organic Growth`}</span>
            <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{` — `}</span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{`Expanded daily usability and impact by reframing the same user beyond basic `}</span>
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{`self-care`}</span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{` into `}</span>
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{`Health Companion`}</span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{` and `}</span>
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{`organizational wellness`}</span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{` scenarios; separated buyer and end-user personas to cut low-value cohorts, while building `}</span>
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{`UGC sharing mechanisms`}</span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{` and `}</span>
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{`peer-to-peer competitive challenges`}</span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{` to drive organic referrals and `}</span>
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{`brand awareness`}</span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{`.`}</span>
          </li>
          <li className="ms-[12px]">
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{`Discovery-Driven Product Spin-offs`}</span>
            <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{` — `}</span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{`Identified two distinct market needs during product discovery; prevented core-product feature bloat by securing management approval to spin them off into two independent, persona-specific products (`}</span>
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{`Rokhnama`}</span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{` and `}</span>
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{`BioPad`}</span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{`), then built both end-to-end with `}</span>
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#0f172a]" style={{ fontVariationSettings: '"opsz" 14' }}>{`AI as a Product Builder`}</span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium" style={{ fontVariationSettings: '"opsz" 14' }}>{` through to active user acquisition and fundraising.`}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function QuixelExperience1() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Quixel Experience">
      <TopBar1 />
      <DescriptionWithTags1 />
    </div>
  );
}

function Tag() {
  return (
    <div className="bg-[#efefef] flex items-center justify-center px-[6px] py-[2px] rounded-[4px] shrink-0" data-name="Tag">
      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[6.5px] text-[#0f172a] whitespace-nowrap" dir="auto">
        React
      </span>
    </div>
  );
}

function Tag1() {
  return (
    <div className="bg-[#efefef] flex items-center justify-center px-[6px] py-[2px] rounded-[4px] shrink-0" data-name="Tag">
      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[6.5px] text-[#0f172a] whitespace-nowrap">
        Product Strategy
      </span>
    </div>
  );
}

function Tag2() {
  return (
    <div className="bg-[#efefef] flex items-center justify-center px-[6px] py-[2px] rounded-[4px] shrink-0" data-name="Tag">
      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[6.5px] text-[#0f172a] whitespace-nowrap">
        Product Discovery
      </span>
    </div>
  );
}

function Tag3() {
  return (
    <div className="bg-[#efefef] flex items-center justify-center px-[6px] py-[2px] rounded-[4px] shrink-0" data-name="Tag">
      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[6.5px] text-[#0f172a] whitespace-nowrap">
        GTM
      </span>
    </div>
  );
}

function Tag4() {
  return (
    <div className="bg-[#efefef] flex items-center justify-center px-[6px] py-[2px] rounded-[4px] shrink-0" data-name="Tag">
      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[6.5px] text-[#0f172a] whitespace-nowrap">
        OKR
      </span>
    </div>
  );
}

function Tag5() {
  return (
    <div className="bg-[#efefef] flex items-center justify-center px-[6px] py-[2px] rounded-[4px] shrink-0" data-name="Tag">
      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[6.5px] text-[#0f172a] whitespace-nowrap">
        Agile/Scrum
      </span>
    </div>
  );
}

function Tag6() {
  return (
    <div className="bg-[#efefef] flex items-center justify-center px-[6px] py-[2px] rounded-[4px] shrink-0" data-name="Tag">
      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[6.5px] text-[#0f172a] whitespace-nowrap">
        Prototyping
      </span>
    </div>
  );
}

function Tags() {
  return (
    <div className="content-start flex flex-wrap gap-[3px] items-start relative shrink-0 w-full mt-[3px]" data-name="Tags">
      <Tag />
      <Tag1 />
      <Tag2 />
      <Tag3 />
      <Tag4 />
      <Tag5 />
      <Tag6 />
    </div>
  );
}

function Component1() {
  return (
    <div className="content-stretch flex flex-col items-start min-w-px relative" data-name="ایران خودرو">
      <QuixelExperience1 />
      <Tags />
    </div>
  );
}

function Content13() {
  return (
    <div className="content-stretch flex items-start justify-center pt-[2px] relative shrink-0 w-[367px]" data-name="Content">
      <Component1 />
    </div>
  );
}

function Experience1() {
  return (
    <div className="content-stretch flex items-stretch justify-between relative shrink-0 w-full" data-name="Experience">
      <StepIconWrap1 />
      <Content13 />
    </div>
  );
}

function MiscDot04L2() {
  return (
    <div className="absolute inset-[18.75%]" data-name="misc/dot_04_l">
      <svg className="absolute block inset-0 size-full" fill="none" height="7.5" preserveAspectRatio="none" viewBox="0 0 7.5 7.5" width="7.5">
        <g id="misc/dot_04_l">
          <path d={svgPaths.p224b5900} fill="#2E2E48" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function StepIconBase2() {
  return (
    <div className="overflow-clip relative rounded-[100px] shrink-0 size-[12px]" data-name="_Step icon base">
      <MiscDot04L2 />
    </div>
  );
}

function Divider7() {
  return (
    <div className="flex-[1_0_0] min-h-px overflow-clip relative rounded-[2px] w-[0.5px]" data-name="Divider">
      <div className="absolute border border-[#e2e6ee] border-solid inset-0" data-name="divider" />
    </div>
  );
}

function StepIconWrap2() {
  return (
    <div className="content-stretch flex flex-col items-center relative self-stretch shrink-0 w-[12px] pt-[2px]" data-name="Step icon wrap">
      <StepIconBase2 />
      <div className="w-[1.5px] flex-1 bg-gradient-to-b from-[#0284c7] via-[#94a3b8] to-[#cbd5e1] rounded-full my-[2px] min-h-[20px] shrink-0" data-name="Divider" />
    </div>
  );
}

function Frame16() {
  return (
    <div className="flex flex-col justify-center min-w-0 flex-[1_0_0] gap-[1px]">
      <p className="font-['Outfit',sans-serif] font-bold text-[#0f172a] text-[10px] leading-tight tracking-[-0.01em] whitespace-nowrap truncate">
        Product Management Mentor
      </p>
      <a className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[#475569] text-[7.5px] leading-tight hover:text-[#0284c7] transition-colors" href="https://app.uxcel.com/ux/shayanesf" target="_blank">
        <p dir="auto">
          Uxcel · 4.8/5 Rating on G2
        </p>
      </a>
    </div>
  );
}

function BasicLocation2() {
  return (
    <div className="relative shrink-0 size-[7px]" data-name="basic/location">
      <svg className="absolute block inset-0 size-full" fill="none" height="7" preserveAspectRatio="none" viewBox="0 0 6 6" width="7">
        <g id="basic/location">
          <path d={svgPaths.p364dd000} fill="#64748B" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Location16() {
  return (
    <div className="content-stretch flex gap-[2px] items-center relative shrink-0" data-name="Location">
      <BasicLocation2 />
      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[#64748b] text-[7px] tracking-[0.02px] whitespace-nowrap">
        Florida · Remote
      </span>
    </div>
  );
}

function DateAndPlace9() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-end relative shrink-0" data-name="Date and place">
      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[#64748b] text-[7px] tracking-[0.02px] whitespace-nowrap">
        Sep 2025 – Present
      </span>
      <Location16 />
    </div>
  );
}

function TopBar2() {
  return (
    <div className="content-stretch flex gap-[5px] items-center justify-between relative shrink-0 w-full min-h-[24px]" data-name="Top Bar">
      <div className="flex items-center gap-[5px] min-w-0 flex-[1_0_0]">
        <div className="relative rounded-[4px] shrink-0 size-[22px] overflow-hidden" data-name="Logo">
          <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgLogo} />
        </div>
        <Frame16 />
      </div>
      <DateAndPlace9 />
    </div>
  );
}

function DescriptionWithTags2() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[360px]" data-name="Description with Tags">
      <div className="[word-break:break-word] font-['Plus_Jakarta_Sans',sans-serif] font-normal leading-[13.5px] relative shrink-0 text-[#334155] text-[8.35px] w-[360px]">
        <p className="mb-[2px] whitespace-pre-wrap">
          <span className="font-medium text-[#334155]">{`Member of the Uxcel mentoring team — ranked among the `}</span>
          <span className="font-bold text-[#0f172a]">
            top 10 product management mentors
          </span>
          <span className="font-medium text-[#334155]">{` on the platform.`}</span>
        </p>
        <p className="mb-[2px] whitespace-pre-wrap">
          <span className="font-medium text-[#334155]">{`Uxcel is a UX and product management learning platform with `}</span>
          <span className="font-bold text-[#0f172a]">
            500,000+ professional users
          </span>
          <span className="font-medium text-[#334155]">{` in 150+ countries; companies including `}</span>
          <span className="font-semibold text-[#0f172a]">
            Microsoft, IBM, Samsung, and Dropbox
          </span>
          <span className="font-medium text-[#334155]">{` use it to upskill their product teams.`}</span>
        </p>
        <ul className="list-disc space-y-[2px]">
          <li className="mb-0 ms-[12px]">
            <span className="font-bold text-[#0f172a]">{`Mentoring & Professional Development`}</span>
            <span className="font-semibold text-[#0f172a]">{` — `}</span>
            <span className="font-normal">
              {`Coached product management professionals worldwide through regular reviews of `}
            </span>
            <span className="font-bold text-[#0f172a]">
              170 real projects
            </span>
            <span className="font-normal">
              {` and structured feedback, focused on developing `}
            </span>
            <span className="font-semibold text-[#0f172a]">
              decision-making and execution skills
            </span>
            <span className="font-normal">
              {` among learners from diverse professional backgrounds.`}
            </span>
          </li>
          <li className="ms-[12px]">
            <span className="font-bold text-[#0f172a]">{`Content Team & Mentor Network Coordination`}</span>
            <span className="font-semibold text-[#0f172a]">{` — `}</span>
            <span className="font-normal">{`Coordinated with Uxcel's content team and international mentor network to design and publish specialized training, ensuring `}</span>
            <span className="font-bold text-[#0f172a]">
              quality consistency
            </span>
            <span className="font-normal">{` across a distributed, multicultural team.`}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function QuixelExperience2() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Quixel Experience">
      <TopBar2 />
      <DescriptionWithTags2 />
    </div>
  );
}

function Frame27() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[2px] relative shrink-0 w-[361px]">
      <QuixelExperience2 />
    </div>
  );
}

function Tag7() {
  return (
    <div className="bg-[#efefef] content-stretch flex items-center justify-center px-[6px] py-[2px] relative rounded-[4px] shrink-0" data-name="Tag">
      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[6.5px] text-[#0f172a] whitespace-nowrap">
        Product Leadership
      </span>
    </div>
  );
}

function Tag8() {
  return (
    <div className="bg-[#efefef] content-stretch flex items-center justify-center px-[6px] py-[2px] relative rounded-[4px] shrink-0" data-name="Tag">
      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[6.5px] text-[#0f172a] whitespace-nowrap">
        Mentorship
      </span>
    </div>
  );
}

function Tag9() {
  return (
    <div className="bg-[#efefef] content-stretch flex items-center justify-center px-[6px] py-[2px] relative rounded-[4px] shrink-0" data-name="Tag">
      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[6.5px] text-[#0f172a] whitespace-nowrap">
        UX Strategy
      </span>
    </div>
  );
}

function Tag10() {
  return (
    <div className="bg-[#efefef] content-stretch flex items-center justify-center px-[6px] py-[2px] relative rounded-[4px] shrink-0" data-name="Tag">
      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[6.5px] text-[#0f172a] whitespace-nowrap">
        Product Team Upskilling
      </span>
    </div>
  );
}

function Tag11() {
  return (
    <div className="bg-[#efefef] content-stretch flex items-center justify-center px-[6px] py-[2px] relative rounded-[4px] shrink-0" data-name="Tag">
      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[6.5px] text-[#0f172a] whitespace-nowrap">
        Coaching
      </span>
    </div>
  );
}

function Tags1() {
  return (
    <div className="content-start flex flex-wrap gap-[3px] items-start relative shrink-0 w-[322px] mt-[3px]" data-name="Tags">
      <Tag7 />
      <Tag8 />
      <Tag9 />
      <Tag10 />
      <Tag11 />
    </div>
  );
}

function Component2() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[1.5px] w-[355px]" data-name="ایران خودرو">
      <Frame27 />
      <Tags1 />
    </div>
  );
}

function Content15() {
  return (
    <div className="relative shrink-0 w-[361px]" data-name="Content">
      <Component2 />
    </div>
  );
}

function Content14() {
  return (
    <div className="content-stretch flex gap-[4px] items-start justify-center pt-[2px] relative shrink-0 w-[362px]" data-name="Content">
      <Content15 />
    </div>
  );
}

function Experience2() {
  return (
    <div className="content-stretch flex items-stretch justify-between relative shrink-0 w-full" data-name="Experience">
      <StepIconWrap2 />
      <Content14 />
    </div>
  );
}

function MiscDot04L3() {
  return (
    <div className="absolute inset-[18.75%]" data-name="misc/dot_04_l">
      <svg className="absolute block inset-0 size-full" fill="none" height="7.5" preserveAspectRatio="none" viewBox="0 0 7.5 7.5" width="7.5">
        <g id="misc/dot_04_l">
          <path d={svgPaths.p224b5900} fill="#2E2E48" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function StepIconBase3() {
  return (
    <div className="overflow-clip relative rounded-[100px] shrink-0 size-[12px]" data-name="_Step icon base">
      <MiscDot04L3 />
    </div>
  );
}

function Divider8() {
  return (
    <div className="flex-[1_0_0] min-h-px overflow-clip relative rounded-[2px] w-[0.5px]" data-name="Divider">
      <div className="absolute border border-[#e2e6ee] border-solid inset-0" data-name="divider" />
    </div>
  );
}

function StepIconWrap3() {
  return (
    <div className="content-stretch flex flex-col items-center relative self-stretch shrink-0 w-[12px] pt-[2px]" data-name="Step icon wrap">
      <StepIconBase3 />
      <div className="w-[1.5px] flex-1 bg-gradient-to-b from-[#0284c7] via-[#94a3b8] to-[#cbd5e1] rounded-full my-[2px] min-h-[20px] shrink-0" data-name="Divider" />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" data-name="Group">
      <svg className="block size-full" fill="none" viewBox="0 0 29.0002 19.9998">
        <g id="Group">
          <path d={svgPaths.p21be9f80} fill="#4CC9F0" id="Vector" />
          <path d={svgPaths.p36391a80} fill="#4CC9F0" id="Vector_2" />
          <path d={svgPaths.p3298fb00} fill="#4CC9F0" id="Vector_3" />
          <path d={svgPaths.p2eead900} fill="#8D8D8D" id="Vector_4" />
          <path d={svgPaths.p2ae6b900} fill="#8E8E8E" id="Vector_5" />
          <path d={svgPaths.p18d2a380} fill="#8E8E8E" id="Vector_6" />
          <path d={svgPaths.p18b20f80} fill="#8E8E8E" id="Vector_7" />
          <path d={svgPaths.p1ff6f70} fill="#8E8E8E" id="Vector_8" />
          <path d={svgPaths.p65ea800} fill="#8D8D8D" id="Vector_9" />
          <path d={svgPaths.p130ff80} fill="#8E8E8E" id="Vector_10" />
          <path d={svgPaths.p11268500} fill="#8E8E8E" id="Vector_11" />
          <path d={svgPaths.p222fe680} fill="#8D8D8D" id="Vector_12" />
          <path d={svgPaths.p3b228200} fill="#8E8E8E" id="Vector_13" />
          <path d={svgPaths.p2acdad00} fill="#8E8E8E" id="Vector_14" />
          <path d={svgPaths.pdd92300} fill="#8E8E8E" id="Vector_15" />
        </g>
      </svg>
    </div>
  );
}

function ClipPathGroup() {
  return (
    <div className="absolute contents inset-0" data-name="Clip path group">
      <Group />
    </div>
  );
}

function OdiLogoIceV() {
  return (
    <div className="h-[24px] overflow-visible relative shrink-0 w-[34.8px]" data-name="ODI-logo-ice-V.1-97_67 2">
      <ClipPathGroup />
    </div>
  );
}

function Frame17() {
  return (
    <div className="flex flex-col justify-center min-w-0 flex-[1_0_0] gap-[1px]">
      <p className="font-['Outfit',sans-serif] font-bold text-[#0f172a] text-[10px] leading-tight tracking-[-0.01em] whitespace-nowrap truncate">
        Frontend Developer
      </p>
      <a className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[#475569] text-[7.5px] leading-tight hover:text-[#0284c7] transition-colors" href="https://ofoghdadeha.com/fa" target="_blank">
        <p dir="auto">Ofogh Dadeha Iranian</p>
      </a>
    </div>
  );
}

function BasicLocation3() {
  return (
    <div className="relative shrink-0 size-[7px]" data-name="basic/location">
      <svg className="absolute block inset-0 size-full" fill="none" height="7" preserveAspectRatio="none" viewBox="0 0 6 6" width="7">
        <g id="basic/location">
          <path d={svgPaths.p364dd000} fill="#64748B" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Location17() {
  return (
    <div className="content-stretch flex gap-[2px] items-center relative shrink-0" data-name="Location">
      <BasicLocation3 />
      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[#64748b] text-[7px] tracking-[0.02px] whitespace-nowrap">
        Tehran, Iran · Hybrid
      </span>
    </div>
  );
}

function DateAndPlace10() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-end relative shrink-0" data-name="Date and place">
      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[#64748b] text-[7px] tracking-[0.02px] whitespace-nowrap">
        Jun 2022 – May 2025
      </span>
      <Location17 />
    </div>
  );
}

function TopBar3() {
  return (
    <div className="content-stretch flex gap-[5px] items-center justify-between relative shrink-0 w-full min-h-[24px]" data-name="Top Bar">
      <div className="flex items-center gap-[5px] min-w-0 flex-[1_0_0]">
        <OdiLogoIceV />
        <Frame17 />
      </div>
      <DateAndPlace10 />
    </div>
  );
}

function DescriptionWithTags3() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[360px]" data-name="Description with Tags">
      <div className="[word-break:break-word] font-['Plus_Jakarta_Sans',sans-serif] font-normal leading-[13.5px] relative shrink-0 text-[#334155] text-[8.35px] w-[360px]">
        <p className="mb-[2px]">
          <span className="font-medium text-[#334155]">{`Front-end developer with strong product mindset, collaborating closely with `}</span>
          <span className="font-bold text-[#0f172a]">
            product, SEO, and marketing teams
          </span>
          <span className="font-medium text-[#334155]">{` to deliver `}</span>
          <span className="font-semibold text-[#0f172a]">
            high-performance, scalable web
          </span>
          <span className="font-medium text-[#334155]">{` experiences. Balanced performance, UX, and maintainability while developing stakeholder empathy and cross-functional execution skills.`}</span>
        </p>
        <ul className="list-disc space-y-[2px]">
          <li className="mb-0 ms-[12px] text-[#334155]">
            <span className="font-bold text-[#0f172a]">{`Website Update & Redesign`}</span>
            <span className="font-semibold text-[#0f172a]">{` — `}</span>
            <span className="font-normal">{`Rebuilt PLP and PDP pages using `}</span>
            <span className="font-bold text-[#0f172a]">
              Angular 17 with SSR
            </span>
            <span className="font-normal">{`, improving performance and SEO; implemented `}</span>
            <span className="font-semibold text-[#0f172a]">
              Bootstrap + Tailwind CSS
            </span>
            <span className="font-normal">{` for a scalable UI, achieving a `}</span>
            <span className="font-bold text-[#0f172a]">
              98+ mobile Lighthouse score
            </span>
            <span className="font-normal">{` and a `}</span>
            <span className="font-bold text-[#0f172a]">
              100 Technical SEO score
            </span>
            <span className="font-normal">.</span>
          </li>
          <li className="mb-0 ms-[12px]">
            <span className="font-bold text-[#0f172a]">
              Venus Project
            </span>
            <span className="font-semibold text-[#0f172a]">{` — `}</span>
            <span className="font-normal text-[#334155]">{`Built MVPs for `}</span>
            <span className="font-bold text-[#0f172a]">
              employee check-in/out, leave management
            </span>
            <span className="font-normal text-[#334155]">{`, and internal dashboards using Angular 14; owned the end-to-end redesign of the `}</span>
            <span className="font-bold text-[#0f172a]">
              cross-platform geolocation flow
            </span>
            <span className="font-normal text-[#334155]">{`, reducing failed location check-in rates by `}</span>
            <span className="font-bold text-[#0f172a]">
              20%
            </span>
            <span className="font-normal text-[#334155]">.</span>
          </li>
          <li className="mb-0 ms-[12px] text-[#334155]">
            <span className="font-bold text-[#0f172a]">{`HR Services & Job Board Panel`}</span>
            <span className="font-semibold text-[#0f172a]">{` — `}</span>
            <span className="font-normal">
              {`Developed and deployed a `}
            </span>
            <span className="font-bold text-[#0f172a]">
              standalone HR subdomain
            </span>
            <span className="font-normal">
              {` featuring job listings, custom applicant pipeline tracking, and internal HR evaluation modules, cutting employee performance evaluation time by `}
            </span>
            <span className="font-bold text-[#0f172a]">
              60%
            </span>
            <span className="font-normal">.</span>
          </li>
          <li className="ms-[12px]">
            <span className="font-bold text-[#0f172a]">
              Marketing Dashboard
            </span>
            <span className="font-semibold text-[#0f172a]">{` — `}</span>
            <span className="font-normal text-[#334155]">{`Delivered `}</span>
            <span className="font-bold text-[#0f172a]">
              real-time KPI, SEO, and behavior dashboards
            </span>
            <span className="font-normal text-[#334155]">{` using `}</span>
            <span className="font-bold text-[#0f172a]">
              Google Analytics, Clarity, and Looker Studio
            </span>
            <span className="font-normal text-[#334155]">{`, enabling marketing channel screening and the identification and removal of `}</span>
            <span className="font-bold text-[#0f172a]">
              funnel friction points
            </span>
            <span className="font-normal text-[#334155]">.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function QuixelExperience3() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Quixel Experience">
      <TopBar3 />
      <DescriptionWithTags3 />
    </div>
  );
}

function Frame28() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[2px] relative shrink-0 w-[361px]">
      <QuixelExperience3 />
    </div>
  );
}

function Tag12() {
  return (
    <div className="bg-[#efefef] flex items-center justify-center px-[6px] py-[2px] rounded-[4px] shrink-0" data-name="Tag">
      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[6.5px] text-[#0f172a] whitespace-nowrap">
        Angular
      </span>
    </div>
  );
}

function Tag13() {
  return (
    <div className="bg-[#efefef] flex items-center justify-center px-[6px] py-[2px] rounded-[4px] shrink-0" data-name="Tag">
      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[6.5px] text-[#0f172a] whitespace-nowrap">
        TypeScript
      </span>
    </div>
  );
}

function Tag14() {
  return (
    <div className="bg-[#efefef] flex items-center justify-center px-[6px] py-[2px] rounded-[4px] shrink-0" data-name="Tag">
      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[6.5px] text-[#0f172a] whitespace-nowrap">
        RxJs
      </span>
    </div>
  );
}

function Tag15() {
  return (
    <div className="bg-[#efefef] flex items-center justify-center px-[6px] py-[2px] rounded-[4px] shrink-0" data-name="Tag">
      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[6.5px] text-[#0f172a] whitespace-nowrap">
        Sass
      </span>
    </div>
  );
}

function Tag16() {
  return (
    <div className="bg-[#efefef] flex items-center justify-center px-[6px] py-[2px] rounded-[4px] shrink-0" data-name="Tag">
      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[6.5px] text-[#0f172a] whitespace-nowrap">
        Angular Material
      </span>
    </div>
  );
}

function Tag17() {
  return (
    <div className="bg-[#efefef] flex items-center justify-center px-[6px] py-[2px] rounded-[4px] shrink-0" data-name="Tag">
      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[6.5px] text-[#0f172a] whitespace-nowrap">
        Bootstrap
      </span>
    </div>
  );
}

function Tag18() {
  return (
    <div className="bg-[#efefef] flex items-center justify-center px-[6px] py-[2px] rounded-[4px] shrink-0" data-name="Tag">
      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[6.5px] text-[#0f172a] whitespace-nowrap">
        UI/UX
      </span>
    </div>
  );
}

function Tag19() {
  return (
    <div className="bg-[#efefef] flex items-center justify-center px-[6px] py-[2px] rounded-[4px] shrink-0" data-name="Tag">
      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[6.5px] text-[#0f172a] whitespace-nowrap">
        OOP
      </span>
    </div>
  );
}

function Tags2() {
  return (
    <div className="content-start flex flex-wrap gap-[3px] items-start relative shrink-0 w-[322px] mt-[3px]" data-name="Tags">
      <Tag12 />
      <Tag13 />
      <Tag14 />
      <Tag15 />
      <Tag16 />
      <Tag17 />
      <Tag18 />
      <Tag19 />
    </div>
  );
}

function Component3() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[1.5px] w-[355px] gap-[4px]" data-name="ایران خودرو">
      <Frame28 />
      <Tags2 />
    </div>
  );
}

function Content17() {
  return (
    <div className="relative shrink-0 w-[361px]" data-name="Content">
      <Component3 />
    </div>
  );
}

function Content16() {
  return (
    <div className="content-stretch flex gap-[4px] items-start justify-center pt-[2px] relative shrink-0 w-[362px]" data-name="Content">
      <Content17 />
    </div>
  );
}

function Experience3() {
  return (
    <div className="content-stretch flex items-stretch justify-between relative shrink-0 w-full" data-name="Experience">
      <StepIconWrap3 />
      <Content16 />
    </div>
  );
}

function Content11() {
  return (
    <div className="content-stretch flex flex-col gap-[5px] items-start relative shrink-0 w-[378px]" data-name="Content">
      <Experience />
      <Experience1 />
      <Experience2 />
      <Experience3 />
    </div>
  );
}

function TailoredExperienceList() {
  const { effectiveTailoredContent } = useResume();
  if (!effectiveTailoredContent) return null;

  const metaById: Record<
    string,
    {
      company: string;
      companyUrl?: string;
      period: string;
      location: string;
      logo: React.ReactNode;
    }
  > = {
    tums: {
      company: "TUMS Health Innoversity",
      period: "Jul 2026 - Present",
      location: "Iran · Advisory",
      logo: (
        <div className="h-[22px] relative shrink-0 w-[20px]">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img alt="" className="absolute h-[109.61%] left-[-6.37%] max-w-none top-[-5.9%] w-[117.22%]" src={imgImageRemovebgPreview1} />
          </div>
        </div>
      ),
    },
    mci: {
      company: "Hamrahe Aval (MCI)",
      companyUrl: "https://delbandcare.com/",
      period: "Apr 2025 - Present",
      location: "Tehran, Iran · Full-time",
      logo: (
        <div className="h-[19px] relative shrink-0 w-[30px]">
          <svg className="absolute block inset-0 size-full" fill="none" height="19" preserveAspectRatio="none" viewBox="0 0 30 19" width="30">
            <path d={svgPaths.p2cbcf800} fill="#0095DA" />
          </svg>
        </div>
      ),
    },
    uxcel: {
      company: "Uxcel · 4.8/5 Rating on G2",
      companyUrl: "https://app.uxcel.com/ux/shayanesf",
      period: "Sep 2025 – Present",
      location: "Florida · Remote",
      logo: (
        <div className="relative rounded-[4px] shrink-0 size-[22px] overflow-hidden">
          <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgLogo} />
        </div>
      ),
    },
    ofoq: {
      company: "Ofogh Dadeha Iranian",
      companyUrl: "https://ofoghdadeha.com/fa",
      period: "Jun 2022 – May 2025",
      location: "Tehran, Iran · Hybrid",
      logo: <OdiLogoIceV />,
    },
  };

  return (
    <div className="content-stretch flex flex-col gap-[5px] items-start relative shrink-0 w-[378px]" data-name="Content">
      {effectiveTailoredContent.experiences.map((exp) => {
        const meta = metaById[exp.id] || metaById.tums;
        return (
          <div key={exp.id} className="content-stretch flex gap-[5px] items-stretch justify-between relative shrink-0 w-full">
            <StepIconWrap />
            <div className="content-stretch flex items-start pt-[2px] relative shrink-0 w-[361px]">
              <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full">
                {/* Top Bar */}
                <div className="content-stretch flex gap-[5px] items-center justify-between relative shrink-0 w-full min-h-[24px]">
                  <div className="flex items-center gap-[5px] min-w-0 flex-[1_0_0]">
                    {meta.logo}
                    <div className="flex flex-col justify-center min-w-0 flex-[1_0_0] gap-[1px]">
                      <p className="font-['Outfit',sans-serif] font-bold text-[#0f172a] text-[10px] leading-tight tracking-[-0.01em] whitespace-nowrap truncate">
                        {exp.role}
                      </p>
                      {meta.companyUrl ? (
                        <a
                          className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[#475569] text-[7.5px] leading-tight hover:text-[#0284c7] transition-colors"
                          href={meta.companyUrl}
                          target="_blank"
                        >
                          <p dir="auto">{meta.company}</p>
                        </a>
                      ) : (
                        <p className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[#475569] text-[7.5px] leading-tight" dir="auto">
                          {meta.company}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="content-stretch flex gap-[4px] items-center justify-end relative shrink-0">
                    <span className="font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[#64748b] text-[7px] tracking-[0.02px] whitespace-nowrap">
                      {meta.period}
                    </span>
                    <div className="content-stretch flex gap-[2px] items-center relative shrink-0">
                      <BasicLocation />
                      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[#64748b] text-[7px] tracking-[0.02px] whitespace-nowrap">
                        {meta.location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description & Bullets */}
                <div className="content-stretch flex items-center relative shrink-0 w-[360px]">
                  <div className="[word-break:break-word] font-['Plus_Jakarta_Sans',sans-serif] font-normal leading-[13.5px] relative shrink-0 text-[#334155] text-[8.35px] w-[360px]">
                    <p className="mb-[2px] whitespace-pre-wrap" dir="auto">
                      <RichText text={exp.intro} strongClassName="font-bold text-[#0f172a]" />
                    </p>
                    <ul className="leading-[11px] list-disc space-y-[2px]">
                      {exp.bullets.map((b, idx) => (
                        <li key={idx} className="mb-0 ms-[12px]">
                          <RichText text={b} strongClassName="font-bold text-[#0f172a]" />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Tags */}
                {exp.tags.length > 0 && (
                  <div className="content-start flex flex-wrap gap-[3px] items-start relative shrink-0 w-full mt-[2px]">
                    {exp.tags.map((tag) => (
                      <div key={tag} className="bg-[#efefef] flex items-center justify-center px-[6px] py-[2px] rounded-[4px] shrink-0">
                        <span className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[6.5px] text-[#0f172a] whitespace-nowrap">
                          {tag}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ExperienceSection() {
  const { effectiveTailoredContent } = useResume();
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Experience section">
      <div className="flex items-center gap-[4px] w-full" data-name="Section Title">
        <span className="w-[3px] h-[12px] rounded-full bg-gradient-to-b from-[#0284c7] to-[#38bdf8] shrink-0 inline-block shadow-[0_0_6px_rgba(2,132,199,0.25)]" />
        <p className="font-['Outfit',sans-serif] font-bold text-[#0f172a] text-[12.5px] tracking-[-0.01em] leading-[16px] whitespace-nowrap">
          Experience
        </p>
        <span className="flex-1 h-[0.5px] bg-gradient-to-r from-[#cbd5e1] via-[#e2e8f0] to-transparent ml-1 inline-block" />
      </div>
      {effectiveTailoredContent ? <TailoredExperienceList /> : <Content11 />}
    </div>
  );
}

function Frame18() {
  return (
    <div className="flex flex-col justify-center min-w-0 flex-[1_0_0] gap-[1px]">
      <p className="font-['Outfit',sans-serif] font-bold text-[#0f172a] text-[10px] leading-tight tracking-[-0.01em] whitespace-nowrap truncate">
        K. N. Toosi University of Technology
      </p>
      <p className="font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[#475569] text-[7.5px] leading-tight" dir="auto">
        Bachelor's degree, Computer Engineering, Computer Software Engineering
      </p>
    </div>
  );
}

function TopBar4() {
  return (
    <div className="content-stretch flex gap-[5px] items-center justify-between relative shrink-0 w-full min-h-[26px]" data-name="Top Bar">
      <div className="flex gap-[5px] items-center min-w-0 flex-[1_0_0]">
        <div className="relative rounded-[4px] shrink-0 size-[24px] overflow-hidden" data-name="Logo">
          <img alt="K. N. Toosi University of Technology" className="object-cover size-full pointer-events-none rounded-[4px]" src={imgLogo1} />
        </div>
        <Frame18 />
      </div>
      <div className="flex items-center shrink-0 pl-[6px]" data-name="Date">
        <span className="font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[#64748b] text-[7.5px] tracking-[0.02px] whitespace-nowrap">
          Jun 2020 – Sep 2025
        </span>
      </div>
    </div>
  );
}

function Card() {
  return (
    <div className="bg-gradient-to-t flex-[1_0_0] from-[rgba(241,245,249,0.7)] to-[rgba(248,250,252,0.8)] border border-[#e2e8f0]/80 min-w-px relative rounded-[6px] px-[10px] py-[6px] w-full" data-name="Card">
      <TopBar4 />
    </div>
  );
}

function Stack() {
  return (
    <div className="content-stretch flex gap-[4px] items-start relative shrink-0 w-full" data-name="Stack">
      <Card />
    </div>
  );
}

function Content18() {
  return (
    <div className="content-stretch flex flex-col items-start relative rounded-[10px] shrink-0 w-full" data-name="Content">
      <Stack />
    </div>
  );
}

function EducationSection() {
  return (
    <div className="content-stretch flex flex-col items-start min-w-px relative rounded-[13px]" data-name="Education section">
      <Content18 />
    </div>
  );
}

function LatestProjects() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[1px] shrink-0 w-full" data-name="Latest projects">
      <EducationSection />
    </div>
  );
}

function List() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[378px]" data-name="List">
      <LatestProjects />
    </div>
  );
}

function ExperienceSection1() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Education section">
      <div className="flex items-center gap-[4px] w-full" data-name="Section Title">
        <span className="w-[3px] h-[12px] rounded-full bg-gradient-to-b from-[#0284c7] to-[#38bdf8] shrink-0 inline-block shadow-[0_0_6px_rgba(2,132,199,0.25)]" />
        <p className="font-['Outfit',sans-serif] font-bold text-[#0f172a] text-[12.5px] tracking-[-0.01em] leading-[16px] whitespace-nowrap">
          Education
        </p>
        <span className="flex-1 h-[0.5px] bg-gradient-to-r from-[#cbd5e1] via-[#e2e8f0] to-transparent ml-1 inline-block" />
      </div>
      <List />
    </div>
  );
}

function Text7() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[2px] items-start relative shrink-0 w-full" data-name="Text">
      <div className="flex flex-col font-['Outfit',sans-serif] font-bold justify-center relative shrink-0 text-[#0f172a] text-[7px] tracking-tight w-full">
        <p className="leading-tight whitespace-nowrap truncate">Rokhnama — Digital Catalog</p>
      </div>
      <div className="flex flex-col font-['Plus_Jakarta_Sans',sans-serif] font-normal justify-center relative shrink-0 text-[#334155] text-[6.5px] leading-[10px] w-full">
        <p>
          <span>{`Built a lightweight `}</span>
          <span className="font-semibold text-[#0f172a]">
            web catalog &amp; digital storefront
          </span>
          <span>{` replacing static PDFs, including a live portal for KNTU International Student Affairs.`}</span>
        </p>
      </div>
    </div>
  );
}

function FeaturedIcon5() {
  return (
    <div className="overflow-clip relative rounded-[100px] shrink-0 size-[13px] flex items-center justify-center" data-name="Featured icon">
      <div className="absolute bg-gradient-to-b from-[rgba(5,133,192,0.16)] inset-0 rounded-[100px] to-[rgba(5,133,192,0.08)]" data-name="Rectangle" />
      <div className="relative z-10 flex items-center justify-center">
        <LinkChainIcon />
      </div>
    </div>
  );
}

function Text8() {
  return (
    <div className="content-stretch flex flex-col items-start min-w-px relative" data-name="Text">
      <a className="[word-break:break-word] block font-['Plus_Jakarta_Sans',sans-serif] font-medium leading-none relative shrink-0 text-[#0284c7] text-[7.5px] w-full no-underline" href="https://rokhnama.vercel.app" target="_blank">
        <p className="cursor-pointer leading-tight hover:underline transition-colors" role="link" tabIndex={0}>
          rokhnama.vercel.app
        </p>
      </a>
    </div>
  );
}

function Row6() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full" data-name="Row">
      <FeaturedIcon5 />
      <Text8 />
    </div>
  );
}

function Content19() {
  return (
    <div className="flex flex-col justify-between p-[8px] min-h-[85px] w-full gap-[5px]" data-name="Content">
      <Text7 />
      <Row6 />
    </div>
  );
}

function Project() {
  return (
    <div className="bg-gradient-to-t flex flex-col from-[rgba(241,245,249,0.7)] to-[rgba(248,250,252,0.8)] border border-[#e2e8f0]/80 rounded-[6px] min-w-0" data-name="Project">
      <Content19 />
    </div>
  );
}

function Text9() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[2px] items-start relative shrink-0 w-full" data-name="Text">
      <div className="flex flex-col font-['Outfit',sans-serif] font-bold justify-center relative shrink-0 text-[#0f172a] text-[7px] tracking-tight w-full">
        <p className="leading-tight whitespace-nowrap truncate">BioPad — Health &amp; Fitness</p>
      </div>
      <div className="flex flex-col font-['Plus_Jakarta_Sans',sans-serif] font-normal justify-center relative shrink-0 text-[#334155] text-[6.5px] leading-[10px] w-full">
        <p>Independent multi-wearable fitness product turning biometric telemetry into workout &amp; recovery insights with 3D interactive mascots and AI coaching.</p>
      </div>
    </div>
  );
}

function FeaturedIcon6() {
  return (
    <div className="overflow-clip relative rounded-[100px] shrink-0 size-[13px] flex items-center justify-center" data-name="Featured icon">
      <div className="absolute bg-gradient-to-b from-[rgba(5,133,192,0.16)] inset-0 rounded-[100px] to-[rgba(5,133,192,0.08)]" data-name="Rectangle" />
      <div className="relative z-10 flex items-center justify-center">
        <LinkChainIcon />
      </div>
    </div>
  );
}

function Text10() {
  return (
    <div className="content-stretch flex flex-col items-start min-w-px relative" data-name="Text">
      <a className="[word-break:break-word] block font-['Plus_Jakarta_Sans',sans-serif] font-medium leading-none relative shrink-0 text-[#0284c7] text-[7.5px] whitespace-nowrap no-underline" href="https://biopad.vercel.app" target="_blank">
        <p className="cursor-pointer leading-tight hover:underline transition-colors" role="link" tabIndex={0}>
          biopad.vercel.app
        </p>
      </a>
    </div>
  );
}

function Row7() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full" data-name="Row">
      <FeaturedIcon6 />
      <Text10 />
    </div>
  );
}

function Content20() {
  return (
    <div className="flex flex-col justify-between p-[8px] min-h-[85px] w-full gap-[5px]" data-name="Content">
      <Text9 />
      <Row7 />
    </div>
  );
}

function Project1() {
  return (
    <div className="bg-gradient-to-t flex flex-col from-[rgba(241,245,249,0.7)] to-[rgba(248,250,252,0.8)] border border-[#e2e8f0]/80 rounded-[6px] min-w-0" data-name="Project">
      <Content20 />
    </div>
  );
}

function Group1() {
  return (
    <div className="flex gap-[4px] items-stretch relative shrink-0 w-full">
      <Project />
      <Project1 />
    </div>
  );
}

function Text11() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[2px] items-start relative shrink-0 w-full" data-name="Text">
      <div className="flex flex-col font-['Outfit',sans-serif] font-bold justify-center relative shrink-0 text-[#0f172a] text-[7px] tracking-tight w-full">
        <p className="leading-tight whitespace-nowrap truncate">Indora — Location Intelligence</p>
      </div>
      <div className="flex flex-col font-['Plus_Jakarta_Sans',sans-serif] font-normal justify-center relative shrink-0 text-[#334155] text-[6.5px] leading-[10px] w-full">
        <p>Shipped location-intelligence platform driving data decisions. Authored PRDs, mapped user journeys, and executed initial GTM strategies.</p>
      </div>
    </div>
  );
}

function FeaturedIcon7() {
  return (
    <div className="overflow-clip relative rounded-[100px] shrink-0 size-[13px] flex items-center justify-center" data-name="Featured icon">
      <div className="absolute bg-gradient-to-b from-[rgba(5,133,192,0.16)] inset-0 rounded-[100px] to-[rgba(5,133,192,0.08)]" data-name="Rectangle" />
      <div className="relative z-10 flex items-center justify-center">
        <LinkChainIcon />
      </div>
    </div>
  );
}

function Text12() {
  return (
    <div className="content-stretch flex flex-col items-start min-w-px relative" data-name="Text">
      <a className="[word-break:break-word] block font-['Plus_Jakarta_Sans',sans-serif] font-medium leading-none relative shrink-0 text-[#0284c7] text-[7.5px] w-full no-underline" href="https://indoora.net" target="_blank">
        <p className="cursor-pointer leading-tight hover:underline transition-colors" role="link" tabIndex={0}>
          indoora.net
        </p>
      </a>
    </div>
  );
}

function Row8() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full" data-name="Row">
      <FeaturedIcon7 />
      <Text12 />
    </div>
  );
}

function Content21() {
  return (
    <div className="flex flex-col justify-between p-[8px] min-h-[85px] w-full gap-[5px]" data-name="Content">
      <Text11 />
      <Row8 />
    </div>
  );
}

function Project2() {
  return (
    <div className="bg-gradient-to-t flex flex-col from-[rgba(241,245,249,0.7)] to-[rgba(248,250,252,0.8)] border border-[#e2e8f0]/80 rounded-[6px] min-w-0" data-name="Project">
      <Content21 />
    </div>
  );
}

function Text13() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[2px] items-start relative shrink-0 w-full" data-name="Text">
      <div className="flex flex-col font-['Outfit',sans-serif] font-bold justify-center relative shrink-0 text-[#0f172a] text-[7px] tracking-tight w-full">
        <p className="leading-tight whitespace-nowrap truncate">Stakeholder Portal</p>
      </div>
      <div className="flex flex-col font-['Plus_Jakarta_Sans',sans-serif] font-normal justify-center relative shrink-0 text-[#334155] text-[6.5px] leading-[10px] w-full">
        <p>Developed web management dashboard integrating Gantt scheduling, task boards, and OKR tracking, centralizing progress to provide transparency for leadership.</p>
      </div>
    </div>
  );
}

function FeaturedIcon8() {
  return (
    <div className="overflow-clip relative rounded-[100px] shrink-0 size-[13px] flex items-center justify-center" data-name="Featured icon">
      <div className="absolute bg-gradient-to-b from-[rgba(5,133,192,0.16)] inset-0 rounded-[100px] to-[rgba(5,133,192,0.08)]" data-name="Rectangle" />
      <div className="relative z-10 flex items-center justify-center">
        <LinkChainIcon />
      </div>
    </div>
  );
}

function Text14() {
  return (
    <div className="content-stretch flex flex-col items-start min-w-px relative" data-name="Text">
      <a className="[word-break:break-word] block font-['Plus_Jakarta_Sans',sans-serif] font-medium leading-none relative shrink-0 text-[#0284c7] text-[7.5px] whitespace-nowrap no-underline" href="https://investor.delbandcare.com" target="_blank">
        <p className="cursor-pointer leading-tight hover:underline transition-colors" role="link" tabIndex={0}>
          investor.delbandcare.com
        </p>
      </a>
    </div>
  );
}

function Row9() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full" data-name="Row">
      <FeaturedIcon8 />
      <Text14 />
    </div>
  );
}

function Content22() {
  return (
    <div className="flex flex-col justify-between p-[8px] min-h-[85px] w-full gap-[5px]" data-name="Content">
      <Text13 />
      <Row9 />
    </div>
  );
}

function Project3() {
  return (
    <div className="bg-gradient-to-t flex flex-col from-[rgba(241,245,249,0.7)] to-[rgba(248,250,252,0.8)] border border-[#e2e8f0]/80 rounded-[6px] min-w-0" data-name="Project">
      <Content22 />
    </div>
  );
}

function Group2() {
  return (
    <div className="flex gap-[4px] items-stretch relative shrink-0 w-full">
      <Project2 />
      <Project3 />
    </div>
  );
}

function Text15() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[2px] items-start relative shrink-0 w-full" data-name="Text">
      <div className="flex flex-col font-['Outfit',sans-serif] font-bold justify-center relative shrink-0 text-[#0f172a] text-[7px] tracking-tight w-full">
        <p className="leading-tight whitespace-nowrap truncate">Eldercare Coordination Program</p>
      </div>
      <div className="flex flex-col font-['Plus_Jakarta_Sans',sans-serif] font-normal justify-center relative shrink-0 text-[#334155] text-[6.5px] leading-[10px] w-full">
        <p>{`Led interdisciplinary clinical team through agile discovery. Defined "trusted caregiver" criteria and capped scope to a live digital pilot, prioritizing readmission reduction.`}</p>
      </div>
    </div>
  );
}

function Content24() {
  return (
    <div className="flex flex-col justify-between p-[8px] min-h-[85px] w-full gap-[5px]" data-name="Content">
      <Text15 />
    </div>
  );
}

function Project4() {
  return (
    <div className="bg-gradient-to-t flex flex-col from-[rgba(241,245,249,0.7)] to-[rgba(248,250,252,0.8)] border border-[#e2e8f0]/80 rounded-[6px] min-w-0" data-name="Project">
      <Content24 />
    </div>
  );
}

function Text16() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[2px] items-start relative shrink-0 w-full" data-name="Text">
      <div className="flex flex-col font-['Outfit',sans-serif] font-bold justify-center relative shrink-0 text-[#0f172a] text-[7px] tracking-tight w-full">
        <p className="leading-tight whitespace-nowrap truncate">Mentorship Services Platform</p>
      </div>
      <div className="flex flex-col font-['Plus_Jakarta_Sans',sans-serif] font-normal justify-center relative shrink-0 text-[#334155] text-[6.5px] leading-[10px] w-full">
        <p>Directed end-to-end product discovery for a mentorship platform. Defined persona-driven workflows and prioritized high-value modules (session management, messaging) through final release.</p>
      </div>
    </div>
  );
}

function Content25() {
  return (
    <div className="flex flex-col justify-between p-[8px] min-h-[85px] w-full gap-[5px]" data-name="Content">
      <Text16 />
    </div>
  );
}

function Project5() {
  return (
    <div className="bg-gradient-to-t flex flex-col from-[rgba(241,245,249,0.7)] to-[rgba(248,250,252,0.8)] border border-[#e2e8f0]/80 rounded-[6px] min-w-0" data-name="Project">
      <Content25 />
    </div>
  );
}

function Content23() {
  return (
    <div className="flex gap-[4px] items-stretch relative shrink-0 w-full" data-name="Content">
      <Project4 />
      <Project5 />
    </div>
  );
}

function Text17() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[2px] items-start relative shrink-0 w-full" data-name="Text">
      <div className="flex flex-col font-['Outfit',sans-serif] font-bold justify-center relative shrink-0 text-[#0f172a] text-[7px] tracking-tight w-full">
        <p className="leading-tight whitespace-nowrap truncate">Mini-App &amp; Messaging Bot Development</p>
      </div>
      <div className="flex flex-col font-['Plus_Jakarta_Sans',sans-serif] font-normal justify-center relative shrink-0 text-[#334155] text-[6.5px] leading-[10px] w-full">
        <p>
          <span>{`Launched a native mini-app and bot across `}</span>
          <span className="font-semibold text-[#0f172a]">
            three domestic messaging platforms
          </span>
          <span>{` (Telegram, Bale, Rubika) with an `}</span>
          <span className="font-semibold text-[#0f172a]">AI reporting &amp; coaching assistant</span>
          <span>{` and UGC sharing; boosted brand awareness, drove organic acquisition of non-hardware users, and `}</span>
          <span className="font-semibold text-[#0f172a]">lowered CAC</span>
          <span>{`.`}</span>
        </p>
      </div>
    </div>
  );
}

function Content26() {
  return (
    <div className="flex flex-col justify-between p-[8px] min-h-[85px] w-full gap-[5px]" data-name="Content">
      <Text17 />
    </div>
  );
}

function Project6() {
  return (
    <div className="bg-gradient-to-t flex flex-col flex-1 basis-0 from-[rgba(241,245,249,0.7)] to-[rgba(248,250,252,0.8)] border border-[#e2e8f0]/80 rounded-[6px] min-w-0" data-name="Project">
      <Content26 />
    </div>
  );
}

function Text18() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[2px] items-start relative shrink-0 w-full" data-name="Text">
      <div className="flex flex-col font-['Outfit',sans-serif] font-bold justify-center relative shrink-0 text-[#0f172a] text-[7px] tracking-tight w-full">
        <p className="leading-tight whitespace-nowrap truncate">Design System &amp; Delband App Redesign</p>
      </div>
      <div className="flex flex-col font-['Plus_Jakarta_Sans',sans-serif] font-normal justify-center relative shrink-0 text-[#334155] text-[6.5px] leading-[10px] w-full">
        <p>
          <span>{`Built Delband's `}</span>
          <span className="font-semibold text-[#0f172a]">design system</span>
          <span>{` and redesigned the mobile app with `}</span>
          <span className="font-semibold text-[#0f172a]">Uxcel and custom AI agents</span>
          <span>{` — saving `}</span>
          <span className="font-semibold text-[#0f172a]">three months</span>
          <span>{` of the product roadmap and cutting design costs by `}</span>
          <span className="font-semibold text-[#0f172a]">60%</span>
          <span>{`.`}</span>
        </p>
      </div>
    </div>
  );
}

function Content27() {
  return (
    <div className="flex flex-col justify-between p-[8px] min-h-[85px] w-full gap-[5px]" data-name="Content">
      <Text18 />
    </div>
  );
}

function Project7() {
  return (
    <div className="bg-gradient-to-t flex flex-col flex-1 basis-0 from-[rgba(241,245,249,0.7)] to-[rgba(248,250,252,0.8)] border border-[#e2e8f0]/80 rounded-[6px] min-w-0" data-name="Project">
      <Content27 />
    </div>
  );
}

function Group5() {
  return (
    <div className="flex gap-[4px] items-stretch relative shrink-0 w-full">
      <Project6 />
      <Project7 />
    </div>
  );
}

function EducationSection1() {
  return (
    <div className="content-stretch flex flex-col justify-between gap-[4px] items-start relative shrink-0 w-full" data-name="Education section">
      <Group1 />
      <Group5 />
      <Group2 />
    </div>
  );
}

function LatestProjects1() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[1px] shrink-0 w-full" data-name="Latest projects">
      <EducationSection1 />
    </div>
  );
}

function List1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[378px]" data-name="List">
      <LatestProjects1 />
    </div>
  );
}

function TailoredProjectsList() {
  const { effectiveTailoredContent } = useResume();
  if (!effectiveTailoredContent) return null;

  const urlMap: Record<string, { label: string; href: string }> = {
    rokhnama: { label: "rokhnama.vercel.app", href: "https://rokhnama.vercel.app" },
    biopad: { label: "biopad.vercel.app", href: "https://biopad.vercel.app" },
    indora: { label: "indoora.net", href: "https://indoora.net" },
    "stakeholder-portal": { label: "investor.delbandcare.com", href: "https://investor.delbandcare.com" },
  };

  const projects = effectiveTailoredContent.projects.slice(0, 6);

  return (
    <div className="grid grid-cols-2 gap-[4px] w-[378px]">
      {projects.map((proj) => {
        const linkInfo = urlMap[proj.id];
        return (
          <div
            key={proj.id}
            className="bg-gradient-to-t flex flex-col from-[rgba(241,245,249,0.7)] to-[rgba(248,250,252,0.8)] border border-[#e2e8f0]/80 rounded-[6px] min-w-0"
          >
            <div className="flex flex-col justify-between p-[8px] min-h-[85px] w-full gap-[5px]">
              <div className="[word-break:break-word] content-stretch flex flex-col gap-[2px] items-start relative shrink-0 w-full">
                <div className="flex flex-col font-['Outfit',sans-serif] font-bold justify-center relative shrink-0 text-[#0f172a] text-[7px] tracking-tight w-full">
                  <p className="leading-tight whitespace-nowrap truncate">{proj.title}</p>
                </div>
                <div className="flex flex-col font-['Plus_Jakarta_Sans',sans-serif] font-normal justify-center relative shrink-0 text-[#334155] text-[6.5px] leading-[10px] w-full">
                  <p>
                    <RichText text={proj.description} strongClassName="font-semibold text-[#0f172a]" />
                  </p>
                </div>
              </div>
              {linkInfo && (
                <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full">
                  <FeaturedIcon5 />
                  <a
                    className="[word-break:break-word] block font-['Plus_Jakarta_Sans',sans-serif] font-medium leading-none relative shrink-0 text-[#0284c7] text-[7.5px] no-underline hover:underline"
                    href={linkInfo.href}
                    target="_blank"
                  >
                    {linkInfo.label}
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LatestProjectsSection() {
  const { effectiveTailoredContent } = useResume();
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-[378px]" data-name="Latest projects section">
      <div className="w-full" data-name="Section Title">
        <div className="flex items-center gap-[4px] w-full">
          <span className="w-[3px] h-[12px] rounded-full bg-gradient-to-b from-[#0284c7] to-[#38bdf8] shrink-0 inline-block shadow-[0_0_6px_rgba(2,132,199,0.25)]" />
          <p className="font-['Outfit',sans-serif] font-bold text-[#0f172a] text-[12.5px] tracking-[-0.01em] leading-[16px] whitespace-nowrap">
            Latest projects
          </p>
          <span className="flex-1 h-[0.5px] bg-gradient-to-r from-[#cbd5e1] via-[#e2e8f0] to-transparent ml-1 inline-block" />
        </div>
      </div>
      {effectiveTailoredContent ? <TailoredProjectsList /> : <List1 />}
    </div>
  );
}

function Frame21() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Frame 21">
      <LatestProjectsSection />
    </div>
  );
}

function Content10() {
  return (
    <div className="content-stretch flex flex-col items-center min-h-px relative w-full gap-[5px]" data-name="Content">
      <ExperienceSection />
      <ExperienceSection1 />
      <Frame21 />
    </div>
  );
}

function Container1() {
  return (
    <div className="bg-[#f9fafb] content-stretch flex flex-col items-center pb-[10px] pt-[10px] px-[16px] relative shrink-0 w-[418px] self-stretch" data-name="Container">
      <Content10 />
    </div>
  );
}

export default function Component4() {
  return (
    <div className="bg-[#f9fafb] content-stretch flex items-stretch relative w-[594px] " data-name="روزمه-02">
      <Aside />
      <div className="absolute left-[-52px] size-[104px] top-[-57px] pointer-events-none">
        <div className="absolute inset-[-150.1%] pointer-events-none">
          <svg className="block size-full" fill="none" height="416.2" preserveAspectRatio="none" viewBox="0 0 416.2 416.2" width="416.2">
            <g filter="url(#filter0_f_0_142)" id="Ellipse 416">
              <circle cx="208.1" cy="208.1" fill="#4EAEDA" r="52" />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="416.2" id="filter0_f_0_142" width="416.2" x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                <feGaussianBlur result="effect1_foregroundBlur_0_142" stdDeviation="78.05" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
      <Container1 />
    </div>
  );
}