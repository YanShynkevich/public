export const descriptors: any = {
    "EState.EState": {
        "version": "1.0.0",
        "name": "EState", 
        "description": "Basic EState descriptors", 
        "descriptors": [
            {
                "name": "MaxEStateIndex", 
                "description": "Maximum EState index", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "MinEStateIndex", 
                "description": "Minimum EState index", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "MaxAbsEStateIndex", 
                "description": "Maximum absolute EState index", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "MinAbsEStateIndex", 
                "description": "Minimum absolute EState index", 
                "type": "double", 
                "tags": ["2D"]
            }
        ]
    }, 
    "QED": {
        "version": "1.1.0", 
        "name": "QED", 
        "description": "QED stands for quantitative estimation of drug-likeness",
        "descriptors": [
            {
                "name": "qed", 
                "description": "Weighted sum of ADS mapped properties", 
                "type": "double", 
                "tags": ["2D"]
            }
        ]
    }, 
    "Descriptors": {
        "version": "1.0.0", 
        "name": "Descriptors", 
        "description": "General descriptors ", 
        "descriptors": [
            {
                "name": "MolWt", 
                "description": "The average molecular weight of the molecule",
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "HeavyAtomMolWt", 
                "description": "The average molecular weight of the molecule ignoring hydrogens", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "ExactMolWt", 
                "description": "The exact molecular weight of the molecule",
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "NumValenceElectrons", 
                "description": "The number of valence electrons the molecule has",
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "NumRadicalElectrons", 
                "description": "The number of radical electrons the molecule has (says nothing about spin state)", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "MaxPartialCharge", 
                "description": "Maximum partial charge", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "MinPartialCharge", 
                "description": "Minimal partial charge", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "MaxAbsPartialCharge", 
                "description": "Maximum absolute partial charge", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "MinAbsPartialCharge", 
                "description": "Minimal absolute partial charge", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "FpDensityMorgan1", 
                "description": "Morgan fingerprint, radius 1", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "FpDensityMorgan2", 
                "description": "Morgan fingerprint, radius 2", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "FpDensityMorgan3", 
                "description": "Morgan fingerprint, radius 3", 
                "type": "double", 
                "tags": ["2D"]
            }
        ]
    }, 
    "ChemUtils.DescriptorUtilities": {
        "version": "1.0.0", 
        "name": "ChemUtils.DescriptorUtilities", 
        "description": "", 
        "descriptors": [
            {
                "name": "BCUT2D_MWHI", 
                "description": "", 
                "type": "string", 
                "tags": []
            }, 
            {
                "name": "BCUT2D_MWLOW", 
                "description": "", 
                "type": "string", 
                "tags": []
            }, 
            {
                "name": "BCUT2D_CHGHI", 
                "description": "", 
                "type": "string", 
                "tags": []
            }, 
            {
                "name": "BCUT2D_CHGLO", 
                "description": "", 
                "type": "string", 
                "tags": []
            }, 
            {
                "name": "BCUT2D_LOGPHI", 
                "description": "", 
                "type": "string", 
                "tags": []
            }, 
            {
                "name": "BCUT2D_LOGPLOW", 
                "description": "", 
                "type": "string", 
                "tags": []
            }, 
            {
                "name": "BCUT2D_MRHI", 
                "description": "", 
                "type": "string", 
                "tags": []
            }, 
            {
                "name": "BCUT2D_MRLOW", 
                "description": "", 
                "type": "string", 
                "tags": []
            }
        ]
    }, 
    "GraphDescriptors": {
        "version": "1.0.0", 
        "name": "GraphDescriptors", 
        "description": "Topological/topochemical descriptors ", 
        "descriptors": [
            {
                "name": "BalabanJ", 
                "description": "Balaban\'s J value", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "BertzCT",
                "description": "A topological index meant to quantify \"complexity\"", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "Chi0", 
                "description": "From equations (1),(9) and (10) of Rev. Comp. Chem. vol 2, 367-422, (1991)", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "Chi0n", 
                "description": "Similar to Hall Kier Chi0v, but uses nVal instead of valence. This makes a big difference after we get out of the first row", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "Chi0v", 
                "description": "From equations (5),(9) and (10) of Rev. Comp. Chem. vol 2, 367-422, (1991)", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "Chi1", 
                "description": "From equations (1),(11) and (12) of Rev. Comp. Chem. vol 2, 367-422, (1991)", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "Chi1n", 
                "description": "Similar to Hall Kier Chi1v, but uses nVal instead of valence", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "Chi1v", 
                "description": "From equations (5),(11) and (12) of Rev. Comp. Chem. vol 2, 367-422, (1991)", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "Chi2n", 
                "description": "Similar to Hall Kier Chi2v, but uses nVal instead of valence.  This makes a big difference after we get out of the first row", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "Chi2v", 
                "description": "From equations (5),(15) and (16) of Rev. Comp. Chem. vol 2, 367-422, (1991)", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "Chi3n", 
                "description": "Similar to Hall Kier Chi3v, but uses nVal instead of valence. This makes a big difference after we get out of the first row", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "Chi3v", 
                "description": "From equations (5),(15) and (16) of Rev. Comp. Chem. vol 2, 367-422, (1991)", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "Chi4n", 
                "description": "Similar to Hall Kier Chi4v, but uses nVal instead of valence. This makes a big difference after we get out of the first row.\\n\\n**NOTE**: because the current path finding code does, by design, detect rings as paths (e.g. in C1CC1 there is *1* atom path of length 3), values of Chi4v may give results that differ from those provided by the old code in molecules that have 3 rings", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "Chi4v", 
                "description": "From equations (5),(15) and (16) of Rev. Comp. Chem. vol 2, 367-422, (1991).\\n\\n**NOTE**: because the current path finding code does, by design, detect rings as paths (e.g. in C1CC1 there is *1* atom path of length 3), values of Chi4v may give results that differ from those provided by the old code in molecules that have 3 rings", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "HallKierAlpha", 
                "description": "The Hall-Kier alpha value for a molecule", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "Ipc", 
                "description": "The information content of the coefficients of the characteristic polynomial of the adjacency matrix of a hydrogen-suppressed graph of a molecule", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "Kappa1", 
                "description": "Hall-Kier Kappa1 value", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "Kappa2", 
                "description": "Hall-Kier Kappa2 value", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "Kappa3", 
                "description": "Hall-Kier Kappa3 value", 
                "type": "double", 
                "tags": ["2D"]
            }
        ]
    }, 
    "MolSurf": {
        "version": "1.0.2", 
        "name": "MolSurf", 
        "description": "MOE-like approximate molecular surface area descriptors", 
        "descriptors": [
            {
                "name": "LabuteASA", 
                "description": "Labute\'s Approximate Surface Area (ASA from MOE)",
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "PEOE_VSA1", 
                "description": "MOE Charge VSA Descriptor 1 (-inf < x < -0.30)",
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "PEOE_VSA10", 
                "description": "MOE Charge VSA Descriptor 10 ( 0.10 <= x < 0.15)",
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "PEOE_VSA11", 
                "description": "MOE Charge VSA Descriptor 11 ( 0.15 <= x < 0.20)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "PEOE_VSA12", 
                "description": "MOE Charge VSA Descriptor 12 ( 0.20 <= x < 0.25)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "PEOE_VSA13", 
                "description": "MOE Charge VSA Descriptor 13 ( 0.25 <= x < 0.30)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "PEOE_VSA14", 
                "description": "MOE Charge VSA Descriptor 14 ( 0.30 <= x < inf)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "PEOE_VSA2", 
                "description": "MOE Charge VSA Descriptor 2 (-0.30 <= x < -0.25)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "PEOE_VSA3", 
                "description": "MOE Charge VSA Descriptor 3 (-0.25 <= x < -0.20)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "PEOE_VSA4", 
                "description": "MOE Charge VSA Descriptor 4 (-0.20 <= x < -0.15)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "PEOE_VSA5", 
                "description": "MOE Charge VSA Descriptor 5 (-0.15 <= x < -0.10)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "PEOE_VSA6", 
                "description": "MOE Charge VSA Descriptor 6 (-0.10 <= x < -0.05)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "PEOE_VSA7", 
                "description": "MOE Charge VSA Descriptor 7 (-0.05 <= x < 0.00)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "PEOE_VSA8", 
                "description": "MOE Charge VSA Descriptor 8 ( 0.00 <= x < 0.05)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "PEOE_VSA9", 
                "description": "MOE Charge VSA Descriptor 9 ( 0.05 <= x < 0.10)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "SMR_VSA1", 
                "description": "MOE MR VSA Descriptor 1 (-inf < x < 1.29)", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "SMR_VSA10", 
                "description": "MOE MR VSA Descriptor 10 ( 4.00 <= x < inf)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "SMR_VSA2", 
                "description": "MOE MR VSA Descriptor 2 ( 1.29 <= x < 1.82)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "SMR_VSA3", 
                "description": "MOE MR VSA Descriptor 3 ( 1.82 <= x < 2.24)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "SMR_VSA4", 
                "description": "MOE MR VSA Descriptor 4 ( 2.24 <= x < 2.45)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "SMR_VSA5", 
                "description": "MOE MR VSA Descriptor 5 ( 2.45 <= x < 2.75)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "SMR_VSA6", 
                "description": "MOE MR VSA Descriptor 6 ( 2.75 <= x < 3.05)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "SMR_VSA7", 
                "description": "MOE MR VSA Descriptor 7 ( 3.05 <= x < 3.63)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "SMR_VSA8", 
                "description": "MOE MR VSA Descriptor 8 ( 3.63 <= x < 3.80)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "SMR_VSA9", 
                "description": "MOE MR VSA Descriptor 9 ( 3.80 <= x < 4.00)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "SlogP_VSA1", 
                "description": "MOE logP VSA Descriptor 1 (-inf < x < -0.40)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "SlogP_VSA10", 
                "description": "MOE logP VSA Descriptor 10 ( 0.40 <= x < 0.50)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "SlogP_VSA11", 
                "description": "MOE logP VSA Descriptor 11 ( 0.50 <= x < 0.60)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "SlogP_VSA12", 
                "description": "MOE logP VSA Descriptor 12 ( 0.60 <= x < inf)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "SlogP_VSA2", 
                "description": "MOE logP VSA Descriptor 2 (-0.40 <= x < -0.20)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "SlogP_VSA3", 
                "description": "MOE logP VSA Descriptor 3 (-0.20 <= x < 0.00)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "SlogP_VSA4", 
                "description": "MOE logP VSA Descriptor 4 ( 0.00 <= x < 0.10)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "SlogP_VSA5", 
                "description": "MOE logP VSA Descriptor 5 ( 0.10 <= x < 0.15)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "SlogP_VSA6", 
                "description": "MOE logP VSA Descriptor 6 ( 0.15 <= x < 0.20)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "SlogP_VSA7", 
                "description": "MOE logP VSA Descriptor 7 ( 0.20 <= x < 0.25)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "SlogP_VSA8", 
                "description": "MOE logP VSA Descriptor 8 ( 0.25 <= x < 0.30)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "SlogP_VSA9", 
                "description": "MOE logP VSA Descriptor 9 ( 0.30 <= x < 0.40)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "TPSA", 
                "description": "The polar surface area of a molecule based upon fragments.", 
                "type": "double", 
                "tags": ["2D"]
            }
        ]
    }, 
    "EState.EState_VSA": {
        "version": "1.0.1", 
        "name": "EState VSA", 
        "description": "Hybrid EState-VSA descriptors (like the MOE VSA descriptors) ",
        "descriptors": [
            {
                "name": "EState_VSA1", 
                "description": "EState VSA Descriptor 1 (-inf < x < -0.39)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "EState_VSA10", 
                "description": "EState VSA Descriptor 10 ( 9.17 <= x < 15.00)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "EState_VSA11", 
                "description": "EState VSA Descriptor 11 ( 15.00 <= x < inf)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "EState_VSA2", 
                "description": "EState VSA Descriptor 2 ( -0.39 <= x < 0.29)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "EState_VSA3", 
                "description": "EState VSA Descriptor 3 ( 0.29 <= x < 0.72)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "EState_VSA4", 
                "description": "EState VSA Descriptor 4 ( 0.72 <= x < 1.17)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "EState_VSA5", 
                "description": "EState VSA Descriptor 5 ( 1.17 <= x < 1.54)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "EState_VSA6", 
                "description": "EState VSA Descriptor 6 ( 1.54 <= x < 1.81)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "EState_VSA7", 
                "description": "EState VSA Descriptor 7 ( 1.81 <= x < 2.05)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "EState_VSA8", 
                "description": "EState VSA Descriptor 8 ( 2.05 <= x < 4.69)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "EState_VSA9", 
                "description": "EState VSA Descriptor 9 ( 4.69 <= x < 9.17)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "VSA_EState1", 
                "description": "VSA EState Descriptor 1 (-inf < x < 4.78)", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "VSA_EState10", 
                "description": "VSA EState Descriptor 10 ( 11.00 <= x < inf)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "VSA_EState2",
                "description": "VSA EState Descriptor 2 ( 4.78 <= x < 5.00)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "VSA_EState3", 
                "description": "VSA EState Descriptor 3 ( 5.00 <= x < 5.41)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "VSA_EState4", 
                "description": "VSA EState Descriptor 4 ( 5.41 <= x < 5.74)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "VSA_EState5", 
                "description": "VSA EState Descriptor 5 ( 5.74 <= x < 6.00)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "VSA_EState6", 
                "description": "VSA EState Descriptor 6 ( 6.00 <= x < 6.07)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "VSA_EState7", 
                "description": "VSA EState Descriptor 7 ( 6.07 <= x < 6.45)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "VSA_EState8", 
                "description": "VSA EState Descriptor 8 ( 6.45 <= x < 7.00)", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "VSA_EState9", 
                "description": "VSA EState Descriptor 9 ( 7.00 <= x < 11.00)", "type": "double", 
                "tags": ["2D"]
            }
        ]
    }, 
    "Lipinski": {
        "version": "1.0.0", 
        "name": "Lipinski", 
        "description": "Lipinski parameters for molecules ", 
        "descriptors": [
            {
                "name": "FractionCSP3", 
                "description": "The fraction of C atoms that are SP3 hybridized", "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "HeavyAtomCount", 
                "description": "The number of heavy atoms a molecule", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "NHOHCount", 
                "description": "The number of NHs or OHs", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "NOCount", 
                "description": "The number of Nitrogens and Oxygens", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "NumAliphaticCarbocycles", 
                "description": "The number of aliphatic (containing at least one non-aromatic bond) carbocycles for a molecule", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "NumAliphaticHeterocycles", 
                "description": "The number of aliphatic (containing at least one non-aromatic bond) heterocycles for a molecule", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "NumAliphaticRings", 
                "description": "The number of aliphatic (containing at least one non-aromatic bond) rings for a molecule", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "NumAromaticCarbocycles", 
                "description": "The number of aromatic carbocycles for a molecule", "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "NumAromaticHeterocycles", 
                "description": "The number of aromatic heterocycles for a molecule", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "NumAromaticRings", 
                "description": "The number of aromatic rings for a molecule", "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "NumHAcceptors", 
                "description": "The number of Hydrogen Bond Acceptors", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "NumHDonors", 
                "description": "The number of Hydrogen Bond Donors", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "NumHeteroatoms", 
                "description": "The number of Heteroatoms", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "NumRotatableBonds", 
                "description": "The number of Rotatable Bonds", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "NumSaturatedCarbocycles", 
                "description": "The number of saturated carbocycles for a molecule", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "NumSaturatedHeterocycles", 
                "description": "The number of saturated heterocycles for a molecule", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "NumSaturatedRings", 
                "description": "The number of saturated rings for a molecule", "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "RingCount", 
                "description": "Ring count", 
                "type": "int", 
                "tags": ["2D"]
            }
        ]
    }, 
    "Crippen": {
        "version": "1.2.0", 
        "name": "Crippen", 
        "description": "Atom-based calculation of LogP and MR using Crippen\'s approach", 
        "descriptors": [
            {
                "name": "MolLogP", 
                "description": "Wildman-Crippen LogP value", 
                "type": "double", 
                "tags": ["2D"]
            }, 
            {
                "name": "MolMR", 
                "description": "Wildman-Crippen MR value", 
                "type": "double", 
                "tags": ["2D"]
            }
        ]
    }, 
    "Fragments": {
        "version": "unknown", 
        "name": "Fragments", 
        "description": "Bunch of fragment descriptors from a file ", 
        "descriptors": [
            {
                "name": "fr_Al_COO", 
                "description": "Number of aliphatic carboxylic acids", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_Al_OH", 
                "description": "Number of aliphatic hydroxyl groups", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_Al_OH_noTert", 
                "description": "Number of aliphatic hydroxyl groups excluding tert-OH", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_ArN", 
                "description": "Number of N functional groups attached to aromatics", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_Ar_COO", 
                "description": "Number of Aromatic carboxylic acide", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_Ar_N", 
                "description": "Number of aromatic nitrogens", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_Ar_NH", 
                "description": "Number of aromatic amines", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_Ar_OH", 
                "description": "Number of aromatic hydroxyl groups", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_COO", 
                "description": "Number of carboxylic acids", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_COO2", 
                "description": "Number of carboxylic acids", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_C_O", 
                "description": "Number of carbonyl O", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_C_O_noCOO", 
                "description": "Number of carbonyl O, excluding COOH", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_C_S", 
                "description": "Number of thiocarbonyl", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_HOCCN", 
                "description": "Number of C(OH)CCN-Ctert-alkyl or C(OH)CCNcyclic", "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_Imine", 
                "description": "Number of Imines", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_NH0", 
                "description": "Number of Tertiary amines", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_NH1", 
                "description": "Number of Secondary amines", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_NH2", 
                "description": "Number of Primary amines", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_N_O", 
                "description": "Number of hydroxylamine groups", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_Ndealkylation1", 
                "description": "Number of XCCNR groups", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_Ndealkylation2", 
                "description": "Number of tert-alicyclic amines (no heteroatoms, not quinine-like bridged N)", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_Nhpyrrole", 
                "description": "Number of H-pyrrole nitrogens", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_SH", 
                "description": "Number of thiol groups", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_aldehyde", 
                "description": "Number of aldehydes", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_alkyl_carbamate", 
                "description": "Number of alkyl carbamates (subject to hydrolysis", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_alkyl_halide", 
                "description": "Number of alkyl halides", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_allylic_oxid", 
                "description": "Number of allylic oxidation sites excluding steroid dienone", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_amide", 
                "description": "Number of amides", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_amidine", 
                "description": "Number of amidine groups", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_aniline", 
                "description": "Number of anilines", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_aryl_methyl", 
                "description": "Number of aryl methyl sites for hydroxylation", "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_azide", 
                "description": "Number of azide groups", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_azo", 
                "description": "Number of azo groups", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_barbitur", 
                "description": "Number of barbiturate groups", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_benzene", 
                "description": "Number of benzene rings", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_benzodiazepine", 
                "description": "Number of benzodiazepines with no additional fused rings", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_bicyclic", 
                "description": "Bicyclic", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_diazo", 
                "description": "Number of diazo groups", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_dihydropyridine", 
                "description": "Number of dihydropyridines", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_epoxide", 
                "description": "Number of epoxide rings", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_ester", 
                "description": "Number of esters", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_ether", 
                "description": "Number of ether oxygens (including phenoxy)", "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_furan", 
                "description": "Number of furan rings", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_guanido", 
                "description": "Number of guanidine groups", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_halogen", 
                "description": "Number of halogens", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_hdrzine", 
                "description": "Number of hydrazine groups", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_hdrzone", 
                "description": "Number of hydrazone groups", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_imidazole", 
                "description": "Number of imidazole rings", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_imide", 
                "description": "Number of imide groups", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_isocyan", 
                "description": "Number of isocyanates", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_isothiocyan", 
                "description": "Number of isothiocyanates", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_ketone", 
                "description": "Number of ketones", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_ketone_Topliss", 
                "description": "Number of ketones excluding diaryl, a,b-unsat", "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_lactam", 
                "description": "Number of beta lactams", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_lactone", 
                "description": "Number of cyclic esters (lactones)", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_methoxy", 
                "description": "Number of methoxy groups -OCH3", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_morpholine", 
                "description": "Number of morpholine rings", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_nitrile", 
                "description": "Number of nitriles", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_nitro", 
                "description": "Number of nitro groups", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_nitro_arom", 
                "description": "Number of nitro benzene ring substituent", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_nitro_arom_nonortho", 
                "description": "Number of non-ortho nitro benzene ring substituents", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_nitroso", 
                "description": "Number of nitroso groups, excluding NO2", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_oxazole", 
                "description": "Number of oxazole rings", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_oxime", 
                "description": "Number of oxime groups", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_para_hydroxylation", 
                "description": "Number of para-hydroxylation sites", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_phenol", 
                "description": "Number of phenols", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_phenol_noOrthoHbond", 
                "description": "Number of phenolic OH excluding ortho intramolecular Hbond substituents", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_phos_acid", 
                "description": "Number of phosphoric acid groups", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_phos_ester", 
                "description": "Number of phosphoric ester groups", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_piperdine", 
                "description": "Number of piperdine rings", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_piperzine", 
                "description": "Number of piperzine rings", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_priamide", 
                "description": "Number of primary amides", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_prisulfonamd", 
                "description": "Number of primary sulfonamides", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_pyridine", 
                "description": "Number of pyridine rings", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_quatN", 
                "description": "Number of quarternary nitrogens", 
                "type": "int",
                "tags": ["2D"]
            }, 
            {
                "name": "fr_sulfide", 
                "description": "Number of thioether", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_sulfonamd", 
                "description": "Number of sulfonamides", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_sulfone", 
                "description": "Number of sulfone groups", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_term_acetylene", 
                "description": "Number of terminal acetylenes", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_tetrazole", 
                "description": "Number of tetrazole rings", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_thiazole", 
                "description": "Number of tetrazole rings",
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_thiocyan", 
                "description": "Number of thiocyanates", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_thiophene", 
                "description": "Number of thiophene rings", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_unbrch_alkane", 
                "description": "Number of unbranched alkanes of at least 4 members (excludes halogenated alkanes)", 
                "type": "int", 
                "tags": ["2D"]
            }, 
            {
                "name": "fr_urea", 
                "description": "Number of urea groups", 
                "type": "int", 
                "tags": ["2D"]
            }
        ]
    }, 
    "Descriptors3D": {
        "version": "1.0.0", 
        "name": "Descriptors 3D", 
        "description": "Descriptors derived from a molecule\'s 3D structure", "descriptors": [
            {
                "name": "PMI1", 
                "description": "First (smallest) principal moment of inertia", "type": "double", 
                "tags": ["3D"]
            }, 
            {
                "name": "PMI2", 
                "description": "Second principal moment of inertia", 
                "type": "double", 
                "tags": ["3D"]
            }, 
            {
                "name": "PMI3", 
                "description": "Third (largest) principal moment of inertia", "type": "double", 
                "tags": ["3D"]
            }, 
            {
                "name": "NPR1", 
                "description": "Normalized principal moments ratio 1 (=I1/I3)", "type": "double", 
                "tags": ["3D"]
            }, 
            {
                "name": "NPR2", 
                "description": "Normalized principal moments ratio 2 (=I2/I3)", "type": "double", 
                "tags": ["3D"]
            }, 
            {
                "name": "RadiusOfGyration", 
                "description": "Radius of gyration", 
                "type": "double", 
                "tags": ["3D"]
            },
            {
                "name": "InertialShapeFactor", 
                "description": "Inertial shape factor", 
                "type": "double", 
                "tags": ["3D"]
            }, 
            {
                "name": "Eccentricity", 
                "description": "Molecular eccentricity", 
                "type": "double", 
                "tags": ["3D"]
            }, 
            {
                "name": "Asphericity", 
                "description": "Molecular asphericity", 
                "type": "double", 
                "tags": ["3D"]
            }, 
            {
                "name": "SpherocityIndex", 
                "description": "Molecular spherocity index", 
                "type": "double", 
                "tags": ["3D"]
            }
        ]
    }
}
