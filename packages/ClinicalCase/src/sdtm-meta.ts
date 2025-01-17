import * as sdtmCols from "./constants/columns-constants";

export const SDTM_VERSION = '1.7';
export const SDTMIG_VERSION = '3.3';

export const enum isRequired {
  REQUIRED,
  EXPECTED,
  PERMITTED
}

export const SdtmClasses = {
  'Events': {
    'AE': 'Adverse Events',
    'CE': 'Clinical Events',
    'DS': 'Disposition',
    'DV': 'Protocol Deviations',
    'HO': 'Healthcare Encounters',
    'MH': 'Medical History',
  },
  'Findings': {
    'CV': 'Cardiovascular System Findings',
    'DA': 'Drug Accountability',
    'DD': 'Death Details',
    'EG': 'ECG Test Results',
    'FA': 'Findings About Events or Interventions',
    'FT': 'Functional Tests',
    'IE': 'Inclusion/Exclusion Criteria Not Met',
    'IS': 'Immunogenicity Specimen Assessments',
    'LB': 'Laboratory Test Results',
    'MB': 'Microbiology Specimen',
    'MI': 'Microscopic Findings',
    'MK': 'Musculoskeletal System Findings',
    'MO': 'Morphology',
    'MS': 'Microbiology Susceptibility',
    'NV': 'Nervous System Findings',
    'OE': 'Ophthalmic Examinations',
    'PC': 'Pharmacokinetics Concentrations',
    'PE': 'Physical Examination',
    'PP': 'Pharmacokinetics Parameters',
    'QS': 'Questionnaires',
    'RE': 'Respiratory System Findings',
    'RP': 'Reproductive System Findings',
    'RS': 'Disease Response and Clin Classification',
    'SC': 'Subject Characteristics',
    'SR': 'Skin Response',
    'SS': 'Subject Status',
    'TR': 'Tumor/Lesion Results',
    'TU': 'Tumor/Lesion Identification',
    'UR': 'Urinary System Findings',
    'VS': 'Vital Signs',
  },
  'Interventions': {
    'AG': 'Procedure Agents',
    'CM': 'Concomitant/Prior Medications',
    'EC': 'Exposure as Collected',
    'EX': 'Exposure',
    'ML': 'Meal Data',
    'PR': 'Procedures',
    'SU': 'Substance Use',
  },
  'Special Purpose': {
    'CO': 'Comments',
    'DM': 'Demographics',
    'SE': 'Subject Elements',
    'SM': 'Subject Disease Milestones',
    'SV': 'Subject Visits',
  },
  'Trial Design': {
    'TA': 'Trial Arms',
    'TD': 'Trial Disease Assessments',
    'TE': 'Trial Elements',
    'TI': 'Trial Inclusion/Exclusion Criteria',
    'TM': 'Trial Disease Milestones',
    'TS': 'Trial Summary',
    'TV': 'Trial Visits',
  },
  'Relationships': {
    'RELREC': 'Related Records',
    'RELSUB': 'Related Subjects',
  },
};

export const domains = {
  ae: {
    [sdtmCols.STUDY_ID]: { label: 'Study Identifier', type: 'Char', req: isRequired.REQUIRED },
    [sdtmCols.DOMAIN]: { label: 'Domain Abbreviation', type: 'Char', req: isRequired.REQUIRED },
    [sdtmCols.SUBJECT_ID] : { label: 'Unique Subject Identifier', type: 'Char', req: isRequired.REQUIRED },
    [sdtmCols.AE_SEQ]: { label: 'Sequence Number', type: 'Num', req: isRequired.REQUIRED },
    'AEGRPID': { label: 'Group ID', type: 'Char', req: isRequired.PERMITTED },
    'AEREFID': { label: 'Reference ID', type: 'Char', req: isRequired.PERMITTED },
    'AESPID': { label: 'Sponsor-Defined Identifier', type: 'Char', req: isRequired.PERMITTED },
    [sdtmCols.AE_TERM]: { label: 'Reported Term for the Adverse Event', type: 'Char', req: isRequired.REQUIRED },
    'AEMODIFY': { label: 'Modified Reported Term', type: 'Char', req: isRequired.PERMITTED },
    'AELLT': { label: 'Lowest Level Term', type: 'Char', req: isRequired.EXPECTED },
    'AELLTCD': { label: 'Lowest Level Term Code', type: 'Num', req: isRequired.EXPECTED },
    [sdtmCols.AE_DECOD_TERM]: { label: 'Dictionary-Derived Term', type: 'Char', req: isRequired.REQUIRED },
    'AEPTCD': { label: 'Preferred Term Code', type: 'Num', req: isRequired.EXPECTED },
    'AEHLT': { label: 'High Level Term', type: 'Char', req: isRequired.EXPECTED },
    'AEHLTCD': { label: 'High Level Term Code', type: 'Num', req: isRequired.EXPECTED },
    'AEHLGT': { label: 'High Level Group Term', type: 'Char', req: isRequired.EXPECTED },
    'AEHLGTCD': { label: 'High Level Group Term Code', type: 'Num', req: isRequired.EXPECTED },
    'AECAT': { label: 'Category for Adverse Event', type: 'Char', req: isRequired.PERMITTED },
    'AESCAT': { label: 'Subcategory for Adverse Event', type: 'Char', req: isRequired.PERMITTED },
    'AEPRESP': { label: 'Pre-Specified Adverse Event', type: 'Char', format: '(NY)', req: isRequired.PERMITTED },
    [sdtmCols.AE_BODY_SYSTEM]: { label: 'Body System or Organ Class', type: 'Char', req: isRequired.EXPECTED },
    'AEBDSYCD': { label: 'Body System or Organ Class Code', type: 'Num', req: isRequired.EXPECTED },
    'AESOC': { label: 'Primary System Organ Class', type: 'Char', req: isRequired.EXPECTED },
    'AESOCCD': { label: 'Primary System Organ Class Code', type: 'Num', req: isRequired.EXPECTED },
    'AELOC': { label: 'Location of Event', type: 'Char', format: '(LOC)', req: isRequired.PERMITTED },
    [sdtmCols.AE_SEVERITY]: { label: 'Severity/Intensity', type: 'Char', format: '(AESEV)', req: isRequired.PERMITTED },
    [sdtmCols.AE_SERIOUS]: { label: 'Serious Event', type: 'Char', format: '(NY)', req: isRequired.EXPECTED },
    'AEACN': { label: 'Action Taken with Study Treatment', type: 'Char', format: '(ACN)', req: isRequired.EXPECTED },
    'AEACNOTH': { label: 'Other Action Taken', type: 'Char', req: isRequired.PERMITTED },
    [sdtmCols.AE_CAUSALITY]: { label: 'Causality', type: 'Char', req: isRequired.EXPECTED },
    'AERELNST': { label: 'Relationship to Non-Study Treatment', type: 'Char', req: isRequired.PERMITTED },
    'AEPATT': { label: 'Pattern of Adverse Event', type: 'Char', req: isRequired.PERMITTED },
    [sdtmCols.AE_OUTCOME]: { label: 'Outcome of Adverse Event', type: 'Char', format: '(OUT)', req: isRequired.PERMITTED },
    'AESCAN': { label: 'Involves Cancer', type: 'Char', format: '(NY)', req: isRequired.PERMITTED },
    'AESCONG': { label: 'Congenital Anomaly or Birth Defect', type: 'Char', format: '(NY)', req: isRequired.PERMITTED },
    'AESDISAB': { label: 'Persist or Signif Disability/Incapacity', type: 'Char', format: '(NY)', req: isRequired.PERMITTED },
    'AESDTH': { label: 'Results in Death', type: 'Char', format: '(NY)', req: isRequired.PERMITTED },
    [sdtmCols.AE_REQ_HOSP]: { label: 'Requires or Prolongs Hospitalization', type: 'Char', format: '(NY)', req: isRequired.PERMITTED },
    'AESLIFE': { label: 'Is Life Threatening', type: 'Char', format: '(NY)', req: isRequired.PERMITTED },
    'AESOD': { label: 'Occurred with Overdose', type: 'Char', format: '(NY)', req: isRequired.PERMITTED },
    'AESMIE': { label: 'Other Medically Important Serious Event', type: 'Char', format: '(NY)', req: isRequired.PERMITTED },
    'AECONTRT': { label: 'Concomitant or Additional Trtmnt Given', type: 'Char', format: '(NY)', req: isRequired.PERMITTED },
    'AETOXGR': { label: 'Standard Toxicity Grade', type: 'Char', req: isRequired.PERMITTED },
    'TAETORD': { label: 'Planned Order of Element within Arm', type: 'Num', req: isRequired.PERMITTED },
    'EPOCH': { label: 'Epoch', type: 'Char', format: '(EPOCH)', req: isRequired.PERMITTED },
    [sdtmCols.AE_START_DATE]: { label: 'Start Date/Time of Adverse Event', type: 'Char', format: 'ISO 8601', req: isRequired.EXPECTED },
    [sdtmCols.AE_END_DATE]: { label: 'End Date/Time of Adverse Event', type: 'Char', format: 'ISO 8601', req: isRequired.EXPECTED },
    [sdtmCols.AE_START_DAY]: { label: 'Study Day of Start of Adverse Event', type: 'Num', req: isRequired.PERMITTED },
    [sdtmCols.AE_END_DAY]: { label: 'Study Day of End of Adverse Event', type: 'Num', req: isRequired.PERMITTED },
    'AEDUR': { label: 'Duration of Adverse Event', type: 'Char', format: 'ISO 8601', req: isRequired.PERMITTED },
    'AEENRF': { label: 'End Relative to Reference Period', type: 'Char', format: '(STENRF)', req: isRequired.PERMITTED },
    'AEENRTPT': { label: 'End Relative to Reference Time Point', type: 'Char', format: '(STENRF)', req: isRequired.PERMITTED },
    'AEENTPT': { label: 'End Reference Time Point', type: 'Char', req: isRequired.PERMITTED },
  },
  cm: {
    [sdtmCols.STUDY_ID]: { label: 'Study Identifier', type: 'Char' },
    [sdtmCols.DOMAIN]: { label: 'Domain Abbreviation', type: 'Char' },
    [sdtmCols.SUBJECT_ID]: { label: 'Unique Subject Identifier', type: 'Char' },
    'CMSEQ': { label: 'Sequence Number', type: 'Num' },
    'CMGRPID': { label: 'Group ID', type: 'Char' },
    'CMSPID': { label: 'Sponsor-Defined Identifier', type: 'Char' },
    [sdtmCols.CON_MED_TRT]: { label: 'Reported Name of Drug, Med, or Therapy', type: 'Char' },
    'CMMODIFY': { label: 'Modified Reported Name', type: 'Char' },
    'CMDECOD': { label: 'Standardized Medication Name', type: 'Char' },
    'CMCAT': { label: 'Category for Medication', type: 'Char' },
    'CMSCAT': { label: 'Subcategory for Medication', type: 'Char' },
    'CMPRESP': { label: 'CM Pre-specified', type: 'Char', format: '(NY)' },
    'CMOCCUR': { label: 'CM Occurrence', type: 'Char', format: '(NY)' },
    'CMSTAT': { label: 'Completion Status', type: 'Char', format: '(ND)' },
    'CMREASND': { label: 'Reason Medication Not Collected', type: 'Char' },
    'CMINDC': { label: 'Indication', type: 'Char' },
    'CMCLAS': { label: 'Medication Class', type: 'Char' },
    'CMCLASCD': { label: 'Medication Class Code', type: 'Char' },
    [sdtmCols.CON_MED_DOSE]: { label: 'Dose per Administration', type: 'Num' },
    'CMDOSTXT': { label: 'Dose Description', type: 'Char' },
    [sdtmCols.CON_MED_DOSE_UNITS]: { label: 'Dose Units', type: 'Char', format: '(UNIT)' },
    'CMDOSFRM': { label: 'Dose Form', type: 'Char', format: '(FRM)' },
    [sdtmCols.CON_MED_DOSE_FREQ]: { label: 'Dosing Frequency per Interval', type: 'Char', format: '(FREQ)' },
    'CMDOSTOT': { label: 'Total Daily Dose', type: 'Num' },
    'CMDOSRGM': { label: 'Intended Dose Regimen', type: 'Char' },
    [sdtmCols.CON_MED_ROUTE]: { label: 'Route of Administration', type: 'Char', format: '(ROUTE)' },
    'CMADJ': { label: 'Reason for Dose Adjustment', type: 'Char' },
    'CMRSDISC': { label: 'Reason the Intervention Was Discontinued', type: 'Char' },
    'TAETORD': { label: 'Planned Order of Element within Arm', type: 'Num' },
    'EPOCH': { label: 'Epoch', type: 'Char', format: '(EPOCH)' },
    'CMSTDTC': { label: 'Start Date/Time of Medication', type: 'Char', format: 'ISO 8601' },
    'CMENDTC': { label: 'End Date/Time of Medication', type: 'Char', format: 'ISO 8601' },
    [sdtmCols.CON_MED_START_DAY]: { label: 'Study Day of Start of Medication', type: 'Num' },
    [sdtmCols.CON_MED_END_DAY]: { label: 'Study Day of End of Medication', type: 'Num' },
    'CMDUR': { label: 'Duration', type: 'Char', format: 'ISO 8601' },
    'CMSTRF': { label: 'Start Relative to Reference Period', type: 'Char', format: '(STENRF)' },
    'CMENRF': { label: 'End Relative to Reference Period', type: 'Char', format: '(STENRF)' },
    'CMSTRTPT': { label: 'Start Relative to Reference Time Point', type: 'Char', format: '(STENRF)' },
    'CMSTTPT': { label: 'Start Reference Time Point', type: 'Char' },
    'CMENRTPT': { label: 'End Relative to Reference Time Point', type: 'Char', format: '(STENRF)' },
    'CMENTPT': { label: 'End Reference Time Point', type: 'Char' },
  },
  dm: {
    [sdtmCols.STUDY_ID]: { label: 'Study Identifier', type: 'Char', req: isRequired.REQUIRED },
    [sdtmCols.DOMAIN]: { label: 'Domain Abbreviation', type: 'Char', req: isRequired.REQUIRED },
    [sdtmCols.SUBJECT_ID]: { label: 'Unique Subject Identifier', type: 'Char', req: isRequired.REQUIRED },
    'SUBJID': { label: 'Subject Identifier for the Study', type: 'Char', req: isRequired.REQUIRED },
    [sdtmCols.SUBJ_REF_STDT]: { label: 'Subject Reference Start Date/Time', type: 'Char', format: 'ISO 8601', req: isRequired.EXPECTED },
    [sdtmCols.SUBJ_REF_ENDT]: { label: 'Subject Reference End Date/Time', type: 'Char', format: 'ISO 8601', req: isRequired.EXPECTED },
    'RFXSTDTC': { label: 'Date/Time of First Study Treatment', type: 'Char', format: 'ISO 8601', req: isRequired.EXPECTED },
    'RFXENDTC': { label: 'Date/Time of Last Study Treatment', type: 'Char', format: 'ISO 8601', req: isRequired.EXPECTED },
    'RFICDTC': { label: 'Date/Time of Informed Consent', type: 'Char', format: 'ISO 8601', req: isRequired.EXPECTED },
    'RFPENDTC': { label: 'Date/Time of End of Participation', type: 'Char', format: 'ISO 8601', req: isRequired.EXPECTED },
    [sdtmCols.DEATH_DATE]: { label: 'Date/Time of Death', type: 'Char', format: 'ISO 8601', req: isRequired.EXPECTED },
    'DTHFL': { label: 'Subject Death Flag', type: 'Char', format: '(NY)', req: isRequired.EXPECTED },
    [sdtmCols.SITE_ID]: { label: 'Study Site Identifier', type: 'Char', req: isRequired.REQUIRED },
    'INVID': { label: 'Investigator Identifier', type: 'Char', req: isRequired.PERMITTED },
    'INVNAM': { label: 'Investigator Name', type: 'Char', req: isRequired.PERMITTED },
    'BRTHDTC': { label: 'Date/Time of Birth', type: 'Char', format: 'ISO 8601', req: isRequired.PERMITTED },
    [sdtmCols.AGE]: { label: 'Age', type: 'Num', req: isRequired.EXPECTED },
    'AGEU': { label: 'Age Units', type: 'Char', format: '(AGEU)', req: isRequired.EXPECTED },
    [sdtmCols.SEX]: { label: 'Sex', type: 'Char', format: '(SEX)', req: isRequired.REQUIRED },
    [sdtmCols.RACE]: { label: 'Race', type: 'Char', format: '(RACE)', req: isRequired.EXPECTED },
    [sdtmCols.ETHNIC]: { label: 'Ethnicity', type: 'Char', format: '(ETHNIC)', req: isRequired.PERMITTED },
    'ARMCD': { label: 'Planned Arm Code', type: 'Char', req: isRequired.EXPECTED },
    'ARM': { label: 'Description of Planned Arm', type: 'Char', req: isRequired.EXPECTED },
    'ACTARMCD': { label: 'Actual Arm Code', type: 'Char', req: isRequired.EXPECTED },
    [sdtmCols.ACT_TRT_ARM]: { label: 'Description of Actual Arm', type: 'Char', req: isRequired.EXPECTED },
    'ARMNRS': { label: 'Reason Arm and/or Actual Arm is Null', type: 'Char', req: isRequired.EXPECTED },
    'ACTARMUD': { label: 'Description of Unplanned Actual Arm', type: 'Char', req: isRequired.EXPECTED },
    'COUNTRY': { label: 'Country', type: 'Char', format: 'ISO 3166-1 Alpha-3', req: isRequired.REQUIRED },
    'DMDTC': { label: 'Date/Time of Collection', type: 'Char', format: 'ISO 8601', req: isRequired.PERMITTED },
    'DMDY': { label: 'Study Day of Collection', type: 'Num', req: isRequired.PERMITTED },
  },
  ex: {
    [sdtmCols.STUDY_ID]: { label: 'Study Identifier', type: 'Char' },
    [sdtmCols.DOMAIN]: { label: 'Domain Abbreviation', type: 'Char' },
    [sdtmCols.SUBJECT_ID]: { label: 'Unique Subject Identifier', type: 'Char' },
    'EXSEQ': { label: 'Sequence Number', type: 'Num' },
    'EXGRPID': { label: 'Group ID', type: 'Char' },
    'EXREFID': { label: 'Reference ID', type: 'Char' },
    'EXSPID': { label: 'Sponsor-Defined Identifier', type: 'Char' },
    'EXLNKID': { label: 'Link ID', type: 'Char' },
    'EXLNKGRP': { label: 'Link Group ID', type: 'Char' },
    [sdtmCols.INV_DRUG_NAME]: { label: 'Name of Treatment', type: 'Char' },
    'EXCAT': { label: 'Category of Treatment', type: 'Char' },
    'EXSCAT': { label: 'Subcategory of Treatment', type: 'Char' },
    [sdtmCols.INV_DRUG_DOSE]: { label: 'Dose', type: 'Num' },
    'EXDOSTXT': { label: 'Dose Description', type: 'Char' },
    [sdtmCols.INV_DRUG_DOSE_UNITS]: { label: 'Dose Units', type: 'Char', format: '(UNIT)' },
    [sdtmCols.INV_DRUG_DOSE_FORM]: { label: 'Dose Form', type: 'Char', format: '(FRM)' },
    [sdtmCols.INV_DRUG_DOSE_FREQ]: { label: 'Dosing Frequency per Interval', type: 'Char', format: '(FREQ)' },
    'EXDOSRGM': { label: 'Intended Dose Regimen', type: 'Char' },
    [sdtmCols.INV_DRUG_ROUTE]: { label: 'Route of Administration', type: 'Char', format: '(ROUTE)' },
    'EXLOT': { label: 'Lot Number', type: 'Char' },
    'EXLOC': { label: 'Location of Dose Administration', type: 'Char', format: '(LOC)' },
    'EXLAT': { label: 'Laterality', type: 'Char', format: '(LAT)' },
    'EXDIR': { label: 'Directionality', type: 'Char', format: '(DIR)' },
    'EXFAST': { label: 'Fasting Status', type: 'Char', format: '(NY)' },
    'EXADJ': { label: 'Reason for Dose Adjustment', type: 'Char' },
    'TAETORD': { label: 'Planned Order of Element within Arm', type: 'Num' },
    'EPOCH': { label: 'Epoch', type: 'Char', format: '(EPOCH)' },
    'EXSTDTC': { label: 'Start Date/Time of Treatment', type: 'Char', format: 'ISO 8601' },
    'EXENDTC': { label: 'End Date/Time of Treatment', type: 'Char', format: 'ISO 8601' },
    [sdtmCols.INV_DRUG_START_DAY]: { label: 'Study Day of Start of Treatment', type: 'Num' },
    [sdtmCols.INV_DRUG_END_DAY]: { label: 'Study Day of End of Treatment', type: 'Num' },
    'EXDUR': { label: 'Duration of Treatment', type: 'Char', format: 'ISO 8601' },
    'EXTPT': { label: 'Planned Time Point Name', type: 'Char' },
    'EXTPTNUM': { label: 'Planned Time Point Number', type: 'Num' },
    'EXELTM': { label: 'Planned Elapsed Time from Time Point Ref', type: 'Char', format: 'ISO 8601' },
    'EXTPTREF': { label: 'Time Point Reference', type: 'Char' },
    'EXRFTDTC': { label: 'Date/Time of Reference Time Point', type: 'Char', format: 'ISO 8601' },
  },
  lb: {
    [sdtmCols.STUDY_ID]: { label: 'Study Identifier', type: 'Char' },
    [sdtmCols.DOMAIN]: { label: 'Domain Abbreviation', type: 'Char', rule: 'regex ^[A-Z]{2}$' },
    [sdtmCols.SUBJECT_ID]: { label: 'Unique Subject Identifier', type: 'Char' },
    'LBSEQ': { label: 'Sequence Number', type: 'Num' },
    'LBGRPID': { label: 'Group ID', type: 'Char' },
    'LBREFID': { label: 'Specimen ID', type: 'Char' },
    'LBSPID': { label: 'Sponsor-Defined Identifier', type: 'Char' },
    'LBTESTCD': { label: 'Lab Test or Examination Short Name', type: 'Char', format: '(LBTESTCD)', rule: 'regex ^[A-Za-z_]{1}[A-Za-z_0-9]{0,7}$' },
    [sdtmCols.LAB_TEST]: { label: 'Lab Test or Examination Name', type: 'Char', format: '(LBTEST)', rule: 'regex ^.{1,40}$' },
    'LBCAT': { label: 'Category for Lab Test', type: 'Char' },
    'LBSCAT': { label: 'Subcategory for Lab Test', type: 'Char' },
    'LBORRES': { label: 'Result or Finding in Original Units', type: 'Char' },
    'LBORRESU': { label: 'Original Units', type: 'Char', format: '(UNIT)' },
    'LBORNRLO': { label: 'Reference Range Lower Limit in Orig Unit', type: 'Char' },
    'LBORNRHI': { label: 'Reference Range Upper Limit in Orig Unit', type: 'Char' },
    'LBSTRESC': { label: 'Character Result/Finding in Std Format', type: 'Char', format: '(LBSTRESC)' },
    [sdtmCols.LAB_RES_N]: { label: 'Numeric Result/Finding in Standard Units', type: 'Num', rule: '${LBSTNRLO}-${LBSTNRHI}' },
    'LBSTRESU': { label: 'Standard Units', type: 'Char', format: '(UNIT)' },
    [sdtmCols.LAB_LO_LIM_N]: { label: 'Reference Range Lower Limit-Std Units', type: 'Num' },
    [sdtmCols.LAB_HI_LIM_N]: { label: 'Reference Range Upper Limit-Std Units', type: 'Num' },
    'LBSTNRC': { label: 'Reference Range for Char Rslt-Std Units', type: 'Char' },
    'LBSTREFC': { label: 'Reference Result in Standard Format', type: 'Char' },
    'LBNRIND': { label: 'Reference Range Indicator', type: 'Char', format: '(NRIND)' },
    'LBSTAT': { label: 'Completion Status', type: 'Char', format: '(ND)' },
    'LBREASND': { label: 'Reason Test Not Done', type: 'Char' },
    'LBNAM': { label: 'Vendor Name', type: 'Char' },
    'LBLOINC': { label: 'LOINC Code', type: 'Char' },
    'LBSPEC': { label: 'Specimen Type', type: 'Char', format: '(SPECTYPE)' },
    'LBSPCCND': { label: 'Specimen Condition', type: 'Char', format: '(SPECCOND)' },
    'LBMETHOD': { label: 'Method of Test or Examination', type: 'Char', format: '(METHOD)' },
    'LBLOBXFL': { label: 'Last Observation Before Exposure Flag', type: 'Char', format: '(NY)' },
    'LBBLFL': { label: 'Baseline Flag', type: 'Char', format: '(NY)' },
    'LBFAST': { label: 'Fasting Status', type: 'Char', format: '(NY)' },
    'LBDRVFL': { label: 'Derived Flag', type: 'Char', format: '(NY)' },
    'LBTOX': { label: 'Toxicity', type: 'Char' },
    'LBTOXGR': { label: 'Standard Toxicity Grade', type: 'Char' },
    'VISITNUM': { label: 'Visit Number', type: 'Num' },
    [sdtmCols.VISIT_NAME]: { label: 'Visit Name', type: 'Char' },
    [sdtmCols.VISIT_DAY]: { label: 'Planned Study Day of Visit', type: 'Num' },
    'TAETORD': { label: 'Planned Order of Element within Arm', type: 'Num' },
    'EPOCH': { label: 'Epoch', type: 'Char', format: '(EPOCH)' },
    'LBDTC': { label: 'Date/Time of Specimen Collection', type: 'Char', format: 'ISO 8601' },
    'LBENDTC': { label: 'End Date/Time of Specimen Collection', type: 'Char', format: 'ISO 8601' },
    [sdtmCols.LAB_DAY]: { label: 'Study Day of Specimen Collection', type: 'Num' },
    'LBENDY': { label: 'Study Day of End of Observation', type: 'Num' },
    'LBTPT': { label: 'Planned Time Point Name', type: 'Char' },
    'LBTPTNUM': { label: 'Planned Time Point Number', type: 'Num' },
    'LBELTM': { label: 'Planned Elapsed Time from Time Point Ref', type: 'Char', format: 'ISO 8601' },
    'LBTPTREF': { label: 'Time Point Reference', type: 'Char' },
    'LBRFTDTC': { label: 'Date/Time of Reference Time Point', type: 'Char', format: 'ISO 8601' },
  },
};
