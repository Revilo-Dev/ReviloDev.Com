import React, { useState, useEffect } from 'react';
import HeaderCard from '../components/HeaderCard';
import ItemInfoCard from '../components/ItemInfoCard';
import TagSelector from '../components/TagSelector';


const allProjects = [
  {
    title: "ReviloDev.com",
    subtitle: "Personal developer website",
    img: "/assets/revilo.png",
    description: "",
    rows: [
      { content: <p><b>Published:</b> Jan 08, 2025</p> },
    ],
    linkUrl: "https://revilodev.com/",
    linkname: "Visit",
    tag: "Websites",
  },
    {
    title: "Flow - Habits and Streaks",
    subtitle: "Android OneUI habit tracker",
    img: "/assets/flow-icon.png",
    description: "",
    rows: [
      { content: <p><b>Published:</b> Sep 9, 2026</p> },
    ],
    PolicyUrl: "/flow-privacy-policy",
    PolicyName: "Privacy Policy",
    linkUrl: "https://play.google.com/store/apps/details?id=com.revilodev.flow",
    linkname: "Get",
    tag: "Apps",
  },
      {
    title: "OneWidget - OneUI Widgets",
    subtitle: "Android OneUI widgets app with oneUI blur",
    img: "/assets/OneWidgets.png",
    description: "",
    rows: [
      { content: <p><b>Published:</b> Sep 9, 2026</p> },
    ],
    PolicyUrl: "/onewidget-privacy-policy",
    PolicyName: "Privacy Policy",
    linkUrl: "https://play.google.com/store/apps/details?id=com.revilodev.onewidget",
    linkname: "Get",
    tag: "Apps",
  },
        {
    title: "OneUI ToolKit",
    subtitle: "Fork of OneUI design repo updated for OneUI 9.0",
    img: "/assets/toolkit.png",
    description: "",
    rows: [
      { content: <p><b>Published:</b> Oct 1, 2026</p> },
    ],
    linkUrl: "https://github.com/Revilo-Dev/oneui-design-9.0",
    linkname: "Fork",
    tag: "Apps",
  },
  
  {
    title: "ReviloLib",
    subtitle: "Open-source code library for reuse across projects",
    img: "/assets/Lib.png",
    description: "",
    rows: [
      { content: <p><b>Published:</b> Mar 29, 2025</p> },
    ],
    linkUrl: "https://github.com/revilo-dev/revilodevcom",
    linkname: "Visit",
    tag: "Websites",
  },
  {
    title: "Itch WebGames",
    subtitle: "Collection of Itch.io web games",
    img: "/assets/itch.png",
    description: "",
    rows: [
      { content: <p><b>Published:</b> Apr 06, 2025</p> },
    ],
    linkUrl: "https://itch-webgames.web.app/",
    linkname: "Visit",
    tag: "Websites",
  },
  {
    title: "Stacks",
    subtitle: "Chat app demo to learn backend development",
    img: "/assets/Stacks.png",
    description: "",
    rows: [
      { content: <p><b>Published:</b> Apr 17, 2025</p> },
    ],
    linkUrl: "https://stacks-j2s9.onrender.com/",
    linkname: "Visit",
    tag: "Websites",
  },
  {
    title: "Weather Dashboard",
    subtitle: "Live weather dashboard with API data",
    img: "/assets/weather.png",
    description: "",
    rows: [
      { content: <p><b>Published:</b> Apr 11, 2025</p> },
    ],
    linkUrl: "https://weatherdashboard-rd.web.app/",
    linkname: "Visit",
    tag: "Websites",
  },
    {
    title: "Productivity Dashboard",
    subtitle: "A simple widget based productivity dashboard with to-do lists, calendars, timers and more",
    img: "/assets/productivity.png",
    description: "",
    rows: [
      { content: <p><b>Published:</b> Apr 23, 2026`</p> },
    ],
    linkUrl: "https://swift-dashboard-bd0ad.web.app",
    linkname: "Visit",
    tag: "Websites",
  },
  {
    title: "Spoko",
    subtitle: "A Portofilo Website for spoko - freelance, built in react",
    img: "/assets/spoko.png",
    description: "",
    rows: [
      { content: <p><b>Published:</b> Oct 11, 2026</p> },
    ],
    linkUrl: "https://spoko.site",
    linkname: "Visit",
    tag: "Websites",
  },
  {
    title: "Twilight Zone",
    subtitle: "My first published game",
    img: "/assets/Twilight.png",
    description: "",
    rows: [
      { content: <p><b>Published:</b> Dec 13, 2024</p> },
      { content: <p><b>Last updated:</b> Dec 13, 2024</p> },
    ],
    linkUrl: "https://revilodev.itch.io/twilightzone",
    linkname: "Visit",
    tag: "Games",
  },
  {
    title: "RUNIC",
    subtitle:
      "Find vanilla's Enchantment system boring and unbalanced? This mod redefines upgrading gear in an RPG-style way.",
    img: "/assets/runic.png",
    description: "",
    rows: [{ content: <p><b>Published:</b> Aug 30, 2025</p> }],
    linkUrl: "https://www.curseforge.com/minecraft/mc-mods/runic-enhancements",
    linkname: "Visit",
    PolicyUrl: "/projects/runic/wiki",
    PolicyName: "Wiki",
    tag: "Modding",
  },
  {
    title: "Boundless Quests",
    subtitle: "Quest system for Minecraft modpacks and progression",
    img: "/assets/Boundless.png",
    description: "",
    rows: [{ content: <p><b>Published:</b> Sep 23, 2025</p> }],
    linkUrl: "https://www.curseforge.com/minecraft/mc-mods/boundless-quests",
    linkname: "Visit",
    tag: "Modding",
  },
  {
    title: "Aura: Skills and Abilities",
    subtitle: "Vanilla like progression-focused skills & Abilities mod",
    img: "/assets/aura.png",
    description: "",
    rows: [{ content: <p><b>Published:</b> Nov 24, 2025</p> }],
    linkUrl: "https://www.curseforge.com/minecraft/mc-mods/codex-skills",
    linkname: "Visit",
    PolicyUrl: "/projects/aura/wiki",
    PolicyName: "Wiki",
    tag: "Modding",
  },
  {
    title: "Gateways to Avarice",
    subtitle: "Real time Custom gateway creation using a crystal and modifier system!",
    img: "/assets/gatesavarice.png",
    description: "",
    rows: [{ content: <p><b>Published:</b> Mar 30, 2026</p> }],
    linkUrl: "https://www.curseforge.com/minecraft/mc-mods/gateways-to-avarice",
    linkname: "Visit",
    tag: "Modding",
  },
  {
    title: "LevelUP",
    subtitle: "Level and progression Library, Use a global level system for progression",
    img: "/assets/LevelUP.png",
    description: "",
    rows: [{ content: <p><b>Published:</b> Mar 21, 2026</p> }],
    linkUrl: "https://www.curseforge.com/minecraft/mc-mods/levelup-api",
    linkname: "Visit",
    tag: "Modding",
  },
  {
    title: "Mythcraft 5",
    subtitle: "Exploration, questing, looting, and progression — Minecraft like never before",
    img: "/assets/MC5.png",
    description: "",
    rows: [{ content: <p><b>Published:</b> Dec 12, 2022</p> }],
    linkUrl: "https://www.curseforge.com/minecraft/modpacks/mythcrafts",
    linkname: "Visit",
    tag: "Modding",
  },
    {
    title: "Mythcraft 6",
    subtitle: "Exploration, questing, looting, and progression — Minecraft like never before",
    img: "/assets/MC6.png",
    description: "",
    rows: [{ content: <p><b>Published:</b> Sep 30, 2026</p> }],
    linkUrl: "https://www.curseforge.com/minecraft/modpacks/mythcraft-6",
    linkname: "Visit",
    tag: "Modding",
  },
  {
    title: "Avarice",
    subtitle: "Avarice: Greed, Combat, Gateways | Level Up and progress through greed",
    img: "/assets/avarice.png",
    description: "",
    rows: [{ content: <p><b>Published:</b> Apr 20, 2026</p> }],
    linkUrl: "https://www.curseforge.com/minecraft/modpacks/avarice-gateways",
    linkname: "Visit",
    tag: "Modding",
  },
  {
    title: "MC-Factory",
    subtitle: "A mix of factory progression and Minecraft",
    img: "/assets/MCF.png",
    description: "",
    rows: [{ content: <p><b>Published:</b> Dec 22, 2022</p> }],
    linkUrl: "https://www.curseforge.com/minecraft/modpacks/mc-factory",
    linkname: "Visit",
    tag: "Modding",
  },
  {
    title: "Chocolate",
    subtitle: "Enhanced Vanilla Minecraft modpack",
    img: "/assets/chocolate.png",
    description: "",
    rows: [{ content: <p><b>Published:</b> Feb 01, 2023</p> }],
    linkUrl: "https://www.curseforge.com/minecraft/modpacks/chocolate-r2",
    linkname: "Visit",
    tag: "Modding",
  },
  {
    title: "StardewCraft",
    subtitle: "Stardew Valley x Minecraft modpack",
    img: "/assets/Stardew.png",
    description: "",
    rows: [{ content: <p><b>Published:</b> Jul 20, 2023</p> }],
    linkUrl: "https://www.curseforge.com/minecraft/modpacks/stardewcraft-r2",
    linkname: "Visit",
    tag: "Modding",
  },
  {
    title: "Amethyst Theme",
    subtitle: "Minecraft UI pack with an amethyst makeover",
    img: "/assets/amethyst.png",
    description: "",
    rows: [{ content: <p><b>Published:</b> Jul 27, 2024</p> }],
    linkUrl: "https://www.curseforge.com/minecraft/texture-packs/amethyst-theme",
    linkname: "Visit",
    tag: "Modding",
  },
  {
    title: "Gilded Theme",
    subtitle: "Minecraft 1.21.1 DarkMode GUI Texturepack - Clean & Simple",
    img: "/assets/gilded.png",
    description: "",
    rows: [{ content: <p><b>Published:</b> Apr 15, 2026</p> }],
    linkUrl: "https://www.curseforge.com/minecraft/texture-packs/gilded-theme",
    linkname: "Visit",
    tag: "Modding",
  },
  {
    title: "DarkUI",
    subtitle: "Dark mode UI pack for 1.21+",
    img: "/assets/darkUI.png",
    description: "",
    rows: [{ content: <p><b>Published:</b> Oct 06, 2024</p> }],
    linkUrl: "https://www.curseforge.com/minecraft/texture-packs/darkui",
    linkname: "Visit",
    tag: "Modding",
  },
  {
    title: "StardewUI",
    subtitle: "Stardew-themed UI pack for Minecraft",
    img: "/assets/Stardew-pack.png",
    description: "",
    rows: [{ content: <p><b>Published:</b> Oct 11, 2024</p> }],
    linkUrl: "https://www.curseforge.com/minecraft/texture-packs/stardew-ui",
    linkname: "Visit",
    tag: "Modding",
  },
  {
    title: "Modern Aesthetic",
    subtitle: "Clean, modern UI inspired by Satisfactory",
    img: "/assets/MCF-theme.png",
    description: "",
    rows: [{ content: <p><b>Published:</b> Feb 17, 2025</p> }],
    linkUrl: "https://www.curseforge.com/minecraft/texture-packs/modern-aesthetic",
    linkname: "Visit",
    tag: "Modding",
  },
  /*{
    title: "Nothing here... yet",
    subtitle: "",
    img: '/assets/revilo.png',
    description: 'Check Github for updates',
    linkUrl: 'https://github.com/Revilo-Dev',
    linkname: 'Visit', 
    tag: 'Software',
  },*/

];

function Projects() {
  const tags = ['Websites', 'Apps', 'Modding', 'Games']; // tags

  const [selectedTag, setSelectedTag] = useState('All');
  const [filteredProjects, setFilteredProjects] = useState(allProjects);

  useEffect(() => {
    if (selectedTag === 'All') {
      setFilteredProjects(allProjects);
    } else {
      setFilteredProjects(allProjects.filter(project => project.tag === selectedTag));
    }
  }, [selectedTag]);

  const handleTagSelect = (tag) => {
    setSelectedTag(tag);
  };

  return (
    <div className="body">
      <HeaderCard />
      <br />
      <div className="flex justify-center w-full A-SlideDownBounce"><TagSelector tags={tags} onTagSelect={handleTagSelect} /></div>
      <div className="content project-collection A-SlideUpBounce grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {filteredProjects.map((project) => (
          <ItemInfoCard
            key={project.title}
            title={project.title}
            subtitle={project.subtitle}
            showLastUpdated={project.tag === 'Websites' || project.tag === 'Modding'}
            row1={project.rows && project.rows[0] ? project.rows[0].content : null}
            row2={project.rows && project.rows[1] ? project.rows[1].content : null}
            row3={project.rows && project.rows[2] ? project.rows[2].content : null}
            img={project.img}
            description={project.description}
            policyLinkUrl={project.PolicyUrl}
            policyLinkName={project.PolicyName}
            linkUrl={project.linkUrl} 
            linkname={project.linkname} 
          />
        ))}

      </div>
    </div>
  );
}

export default Projects;
