import { CourseTable } from "@/components/CourseTable";
import { CourseHeader } from "@/components/CourseHeader";
import { downloadCSV } from "@/utils/csvExport";
import Footer from "@/components/Footer";

const Index = () => {
  // Course data from the provided JSON
  const courseData = [
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00000015",
      "LSNo": 1,
      "Category": "FC",
      "Code": "FC-0201",
      "Title": "Indian Civilisations",
      "LSCode": "FC-0201-1",
      "DisplayCode": "FC-0201-1",
      "Faculty": "gaurav.garg@ashoka.edu.in, pooja.hazra_tf@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00000015",
      "LSNo": 2,
      "Category": "FC",
      "Code": "FC-0201",
      "Title": "Indian Civilisations",
      "LSCode": "FC-0201-2",
      "DisplayCode": "FC-0201-2",
      "Faculty": "indivar.kamtekar@ashoka.edu.in, madhav.nayar_tf@ashoka.edu.in, toorni.biswas_tf@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00000015",
      "LSNo": 3,
      "Category": "FC",
      "Code": "FC-0201",
      "Title": "Indian Civilisations",
      "LSCode": "FC-0201-3",
      "DisplayCode": "FC-0201-3",
      "Faculty": "nayanjot.lahiri@ashoka.edu.in, nabajyoti.ghosh_tf@ashoka.edu.in, anubhav.nirankari_tf@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00000015",
      "LSNo": 4,
      "Category": "FC",
      "Code": "FC-0201",
      "Title": "Indian Civilisations",
      "LSCode": "FC-0201-4",
      "DisplayCode": "FC-0201-4",
      "Faculty": "tanika.sarkar@ashoka.edu.in",
      "isCatalogueExist": 0
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00000015",
      "LSNo": 5,
      "Category": "FC",
      "Code": "FC-0201",
      "Title": "Indian Civilisations",
      "LSCode": "FC-0201-5",
      "DisplayCode": "FC-0201-5",
      "Faculty": "anindita.chatterjee@ashoka.edu.in, sourav.saha_tf@ashoka.edu.in, renu.singh_tf@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00000015",
      "LSNo": 6,
      "Category": "FC",
      "Code": "FC-0201",
      "Title": "Indian Civilisations",
      "LSCode": "FC-0201-6",
      "DisplayCode": "FC-0201-6",
      "Faculty": "amar.farooqui@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00000018",
      "LSNo": 1,
      "Category": "FC",
      "Code": "FC-0503",
      "Title": "Mind and Behaviour",
      "LSCode": "FC-0503-1",
      "DisplayCode": "FC-0503-1",
      "Faculty": "aarthy.vaidyanathan@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00000018",
      "LSNo": 2,
      "Category": "FC",
      "Code": "FC-0503",
      "Title": "Mind and Behaviour",
      "LSCode": "FC-0503-2",
      "DisplayCode": "FC-0503-2",
      "Faculty": "aarthy.vaidyanathan@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00000018",
      "LSNo": 3,
      "Category": "FC",
      "Code": "FC-0503",
      "Title": "Mind and Behaviour",
      "LSCode": "FC-0503-3",
      "DisplayCode": "FC-0503-3",
      "Faculty": "arindam.chakrabarti@ashoka.edu.in, mahika.sampat_tf@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00000018",
      "LSNo": 4,
      "Category": "FC",
      "Code": "FC-0503",
      "Title": "Mind and Behaviour",
      "LSCode": "FC-0503-4",
      "DisplayCode": "FC-0503-4",
      "Faculty": "kathleen.harbin@ashoka.edu.in, simran.tapaswi_tf@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00000018",
      "LSNo": 5,
      "Category": "FC",
      "Code": "FC-0503",
      "Title": "Mind and Behaviour",
      "LSCode": "FC-0503-5",
      "DisplayCode": "FC-0503-5",
      "Faculty": "nandini.singh@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00000018",
      "LSNo": 6,
      "Category": "FC",
      "Code": "FC-0503",
      "Title": "Mind and Behaviour",
      "LSCode": "FC-0503-6",
      "DisplayCode": "FC-0503-6",
      "Faculty": "merve.tapinc@ashoka.edu.in, tanisha.agarwal_tf@ashoka.edu.in, aditya.sen_tf@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00000483",
      "LSNo": 1,
      "Category": "FC",
      "Code": "FC-0306",
      "Title": "Quantitative Reasoning and Mathematical Thinking ",
      "LSCode": "FC-0306-1",
      "DisplayCode": "FC-0306-1",
      "Faculty": "debayan.gupta@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00000483",
      "LSNo": 2,
      "Category": "FC",
      "Code": "FC-0306",
      "Title": "Quantitative Reasoning and Mathematical Thinking ",
      "LSCode": "FC-0306-2",
      "DisplayCode": "FC-0306-2",
      "Faculty": "mihir.bhattacharya@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00000483",
      "LSNo": 3,
      "Category": "FC",
      "Code": "FC-0306",
      "Title": "Quantitative Reasoning and Mathematical Thinking ",
      "LSCode": "FC-0306-3",
      "DisplayCode": "FC-0306-3",
      "Faculty": "suban@ashoka.edu.in, christa.linu_tf@ashoka.edu.in, ayush.malik_tf@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00000483",
      "LSNo": 4,
      "Category": "FC",
      "Code": "FC-0306",
      "Title": "Quantitative Reasoning and Mathematical Thinking ",
      "LSCode": "FC-0306-4",
      "DisplayCode": "FC-0306-4",
      "Faculty": "abheek.barua@ashoka.edu.in, gaurika.adukia_ug25@ashoka.edu.in, ved.kushalappamc_ug25@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00000483",
      "LSNo": 5,
      "Category": "FC",
      "Code": "FC-0306",
      "Title": "Quantitative Reasoning and Mathematical Thinking ",
      "LSCode": "FC-0306-5",
      "DisplayCode": "FC-0306-5",
      "Faculty": "abhishek.khetan@ashoka.edu.in",
      "isCatalogueExist": 0
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00000483",
      "LSNo": 6,
      "Category": "FC",
      "Code": "FC-0306",
      "Title": "Quantitative Reasoning and Mathematical Thinking ",
      "LSCode": "FC-0306-6",
      "DisplayCode": "FC-0306-6",
      "Faculty": "chandan.dalawat@ashoka.edu.in",
      "isCatalogueExist": 0
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00000528",
      "LSNo": 1,
      "Category": "FC",
      "Code": "FC-0102",
      "Title": "Environmental Studies",
      "LSCode": "FC-0102-1",
      "DisplayCode": "FC-0102-1",
      "Faculty": "ghazala.shahabuddin@ashoka.edu.in, bhavana.gudnavar_ug25@ashoka.edu.in, ananya.karel_ug25@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00000528",
      "LSNo": 2,
      "Category": "FC",
      "Code": "FC-0102",
      "Title": "Environmental Studies",
      "LSCode": "FC-0102-2",
      "DisplayCode": "FC-0102-2",
      "Faculty": "manvi.sharma@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00000528",
      "LSNo": 3,
      "Category": "FC",
      "Code": "FC-0102",
      "Title": "Environmental Studies",
      "LSCode": "FC-0102-3",
      "DisplayCode": "FC-0102-3",
      "Faculty": "mitul.baruah@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00000528",
      "LSNo": 4,
      "Category": "FC",
      "Code": "FC-0102",
      "Title": "Environmental Studies",
      "LSCode": "FC-0102-4",
      "DisplayCode": "FC-0102-4",
      "Faculty": "mukul.sharma@ashoka.edu.in, dersh.savla_ug2023@ashoka.edu.in, kyra.chhetri_ug25@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00000528",
      "LSNo": 5,
      "Category": "FC",
      "Code": "FC-0102",
      "Title": "Environmental Studies",
      "LSCode": "FC-0102-5",
      "DisplayCode": "FC-0102-5",
      "Faculty": "simon.brown@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00000528",
      "LSNo": 6,
      "Category": "FC",
      "Code": "FC-0102",
      "Title": "Environmental Studies",
      "LSCode": "FC-0102-6",
      "DisplayCode": "FC-0102-6",
      "Faculty": "asmita.kabra@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00002684",
      "LSNo": 1,
      "Category": "FC",
      "Code": "FC-0801",
      "Title": "Principles of Science",
      "LSCode": "FC-0801-1",
      "DisplayCode": "FC-0801-1",
      "Faculty": "dipyaman.ganguly@ashoka.edu.in, afthab.saleem_tf@ashoka.edu.in, sreelakshmi.s_tf@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00002684",
      "LSNo": 2,
      "Category": "FC",
      "Code": "FC-0801",
      "Title": "Principles of Science",
      "LSCode": "FC-0801-2",
      "DisplayCode": "FC-0801-2",
      "Faculty": "Kasturi.mitra@ashoka.edu.in, gautam.basu@ashoka.edu.in, tanisha.singh_tf@ashoka.edu.in, megha.rai_phd22@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00002684",
      "LSNo": 3,
      "Category": "FC",
      "Code": "FC-0801",
      "Title": "Principles of Science",
      "LSCode": "FC-0801-3",
      "DisplayCode": "FC-0801-3",
      "Faculty": "shraddha.karve@ashoka.edu.in, somak.raychaudhury@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00002684",
      "LSNo": 4,
      "Category": "FC",
      "Code": "FC-0801",
      "Title": "Principles of Science",
      "LSCode": "FC-0801-4",
      "DisplayCode": "FC-0801-4",
      "Faculty": "vidya.avasare@ashoka.edu.in, sourav.pal@ashoka.edu.in, akshaya.pai_ug2023@ashoka.edu.in, sanjana.gopalakrishnan_ug2023@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00002684",
      "LSNo": 5,
      "Category": "FC",
      "Code": "FC-0801",
      "Title": "Principles of Science",
      "LSCode": "FC-0801-5",
      "DisplayCode": "FC-0801-5",
      "Faculty": "sujan.sengupta@ashoka.edu.in, sudipto.kundu_tf@ashoka.edu.in, ryka.menon_ug25@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00002684",
      "LSNo": 6,
      "Category": "FC",
      "Code": "FC-0801",
      "Title": "Principles of Science",
      "LSCode": "FC-0801-6",
      "DisplayCode": "FC-0801-6",
      "Faculty": "vikram.vyas@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00002684",
      "LSNo": 7,
      "Category": "FC",
      "Code": "FC-0801",
      "Title": "Principles of Science",
      "LSCode": "FC-0801-7",
      "DisplayCode": "FC-0801-7",
      "Faculty": "sanjay.jain@ashoka.edu.in, kabeer.kumar_tf@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00002685",
      "LSNo": 1,
      "Category": "FC",
      "Code": "FC-0701",
      "Title": "Literature and the World",
      "LSCode": "FC-0701-1",
      "DisplayCode": "FC-0701-1",
      "Faculty": "abir.bazaz@ashoka.edu.in, sakshi.nadkarni_tf@ashoka.edu.in",
      "isCatalogueExist": 0
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00002685",
      "LSNo": 2,
      "Category": "FC",
      "Code": "FC-0701",
      "Title": "Literature and the World",
      "LSCode": "FC-0701-2",
      "DisplayCode": "FC-0701-2",
      "Faculty": "rita.kothari@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00002685",
      "LSNo": 3,
      "Category": "FC",
      "Code": "FC-0701",
      "Title": "Literature and the World",
      "LSCode": "FC-0701-3",
      "DisplayCode": "FC-0701-3",
      "Faculty": "saikat.majumdar@ashoka.edu.in, ahilya.dang_tf@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00002685",
      "LSNo": 4,
      "Category": "FC",
      "Code": "FC-0701",
      "Title": "Literature and the World",
      "LSCode": "FC-0701-4",
      "DisplayCode": "FC-0701-4",
      "Faculty": "subhasree.chakravarty@ashoka.edu.in",
      "isCatalogueExist": 0
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00002685",
      "LSNo": 5,
      "Category": "FC",
      "Code": "FC-0701",
      "Title": "Literature and the World",
      "LSCode": "FC-0701-5",
      "DisplayCode": "FC-0701-5",
      "Faculty": "v.v.narayan@ashoka.edu.in, kasapuram.chandra_tf@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00002686",
      "LSNo": 1,
      "Category": "FC",
      "Code": "FC-0601",
      "Title": "Great Books",
      "LSCode": "FC-0601-1",
      "DisplayCode": "FC-0601-1",
      "Faculty": "arpita.das@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00002686",
      "LSNo": 2,
      "Category": "FC",
      "Code": "FC-0601",
      "Title": "Great Books",
      "LSCode": "FC-0601-2",
      "DisplayCode": "FC-0601-2",
      "Faculty": "arunava.sinha@ashoka.edu.in, aratrika.ghosh_tf@ashoka.edu.in, gurnoor.kaur_ug2023@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00002686",
      "LSNo": 3,
      "Category": "FC",
      "Code": "FC-0601",
      "Title": "Great Books",
      "LSCode": "FC-0601-3",
      "DisplayCode": "FC-0601-3",
      "Faculty": "devapriya.roy@ashoka.edu.in, manisha.kumari_ug2023@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00002686",
      "LSNo": 4,
      "Category": "FC",
      "Code": "FC-0601",
      "Title": "Great Books",
      "LSCode": "FC-0601-4",
      "DisplayCode": "FC-0601-4",
      "Faculty": "rudrangshu.mukherjee@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00002686",
      "LSNo": 5,
      "Category": "FC",
      "Code": "FC-0601",
      "Title": "Great Books",
      "LSCode": "FC-0601-5",
      "DisplayCode": "FC-0601-5",
      "Faculty": "s.kumar@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00002686",
      "LSNo": 6,
      "Category": "FC",
      "Code": "FC-0601",
      "Title": "Great Books",
      "LSCode": "FC-0601-6",
      "DisplayCode": "FC-0601-6",
      "Faculty": "alexander.phillips@ashoka.edu.in, shruti.sarkar_tf@ashoka.edu.in, aditya.chauhan_tf@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00003326",
      "LSNo": 1,
      "Category": "FC",
      "Code": "FC-0412",
      "Title": "Economy, Politics and Society",
      "LSCode": "FC-0412-1",
      "DisplayCode": "FC-0412-1",
      "Faculty": "chitralekha@ashoka.edu.in, meher.kaur_tf@ashoka.edu.in, aadya.jha_ug2023@ashoka.edu.in, madiha.tariq_ug2023@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00003326",
      "LSNo": 2,
      "Category": "FC",
      "Code": "FC-0412",
      "Title": "Economy, Politics and Society",
      "LSCode": "FC-0412-2",
      "DisplayCode": "FC-0412-2",
      "Faculty": "kathryn.hardy@ashoka.edu.in",
      "isCatalogueExist": 0
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00003326",
      "LSNo": 3,
      "Category": "FC",
      "Code": "FC-0412",
      "Title": "Economy, Politics and Society",
      "LSCode": "FC-0412-3",
      "DisplayCode": "FC-0412-3",
      "Faculty": "malvika.maheshwari@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00003326",
      "LSNo": 4,
      "Category": "FC",
      "Code": "FC-0412",
      "Title": "Economy, Politics and Society",
      "LSCode": "FC-0412-4",
      "DisplayCode": "FC-0412-4",
      "Faculty": "nitish.kashyap@ashoka.edu.in, garima_tf@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00003326",
      "LSNo": 5,
      "Category": "FC",
      "Code": "FC-0412",
      "Title": "Economy, Politics and Society",
      "LSCode": "FC-0412-5",
      "DisplayCode": "FC-0412-5",
      "Faculty": "pallavi.raghavan@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00003326",
      "LSNo": 6,
      "Category": "FC",
      "Code": "FC-0412",
      "Title": "Economy, Politics and Society",
      "LSCode": "FC-0412-6",
      "DisplayCode": "FC-0412-6",
      "Faculty": "ravindran.sriramachandran@ashoka.edu.in",
      "isCatalogueExist": 1
    },
    {
      "ScheduleSysGenId": "SCH00000034",
      "CourseSysGenId": "CRS00003326",
      "LSNo": 7,
      "Category": "FC",
      "Code": "FC-0412",
      "Title": "Economy, Politics and Society",
      "LSCode": "FC-0412-7",
      "DisplayCode": "FC-0412-7",
      "Faculty": "abheek.barua@ashoka.edu.in, esha.anand_ug25@ashoka.edu.in",
      "isCatalogueExist": 1
    }
  ];

  const totalCourses = courseData.length;
  const activeCourses = courseData.filter(course => course.isCatalogueExist === 1).length;
  const inactiveCourses = totalCourses - activeCourses;

  const handleDownloadCSV = () => {
    downloadCSV(courseData, 'ashoka-course-schedule.csv');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 font-mono">
      <div className="max-w-7xl mx-auto">
        <CourseHeader 
          totalCourses={totalCourses}
          activeCourses={activeCourses}
          inactiveCourses={inactiveCourses}
          data={courseData}
          onDownloadCSV={handleDownloadCSV}
        />
        {/* Mobile: condensed list cards */}
        <div className="md:hidden mt-4 space-y-2">
          {courseData.map((c) => (
            <div key={`${c.ScheduleSysGenId}-${c.LSNo}`} className="border rounded p-3 bg-card text-card-foreground">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate" title={c.Title}>{c.Title}</div>
                  <div className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
                    <code className="bg-muted px-1.5 py-0.5 rounded">{c.Code}</code>
                    <span className="truncate" title={c.LSCode}>{c.LSCode}</span>
                  </div>
                  {c.Faculty && (
                    <div className="mt-1 text-[11px] text-muted-foreground line-clamp-2" title={c.Faculty}>{c.Faculty}</div>
                  )}
                </div>
                <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded border ${c.isCatalogueExist === 1 ? 'bg-green-100 text-green-800 border-green-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                  {c.isCatalogueExist === 1 ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
            </div>
          ))}
        </div>
        {/* Desktop: full table remains unchanged */}
        <div className="hidden md:block">
          <CourseTable data={courseData} />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Index;
