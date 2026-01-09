const Settings = require('../../models/settings');
const Package = require('../../models/package');
const saveImageToAWS = require('../../functions/base64toAWS');

// Get settings (or create if doesn't exist)
const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        
        // If no settings exist, create default
        if (!settings) {
            settings = await Settings.create({
                priceRanges: [{
                    fromKm: 0,
                    toKm: 10,
                    startingPrice: 20,
                    pricePerKm: 5
                }],
                maxSearchRangeKm: 50,
                referralPrize: 10
            });
        }
        
        res.status(200).json(settings);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update price ranges
const updatePriceRanges = async (req, res) => {
    try {
        const { priceRanges } = req.body;
        
        if (!priceRanges || !Array.isArray(priceRanges) || priceRanges.length === 0) {
            throw Error('يجب توفير نطاقات الأسعار');
        }
        
        // Validate each range
        for (let i = 0; i < priceRanges.length; i++) {
            const range = priceRanges[i];
            
            if (!range.fromKm && range.fromKm !== 0) {
                throw Error(`النطاق ${i + 1}: من كم مطلوب`);
            }
            if (!range.toKm) {
                throw Error(`النطاق ${i + 1}: إلى كم مطلوب`);
            }
            if (!range.startingPrice && range.startingPrice !== 0) {
                throw Error(`النطاق ${i + 1}: السعر الابتدائي مطلوب`);
            }
            if (!range.pricePerKm && range.pricePerKm !== 0) {
                throw Error(`النطاق ${i + 1}: السعر لكل كم مطلوب`);
            }
            
            if (range.fromKm < 0 || range.toKm < 0 || range.startingPrice < 0 || range.pricePerKm < 0) {
                throw Error(`النطاق ${i + 1}: جميع القيم يجب أن تكون موجبة`);
            }
            
            if (range.fromKm >= range.toKm) {
                throw Error(`النطاق ${i + 1}: من كم يجب أن يكون أقل من إلى كم`);
            }
        }
        
        // Sort ranges by fromKm
        priceRanges.sort((a, b) => a.fromKm - b.fromKm);
        
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ priceRanges });
        } else {
            settings.priceRanges = priceRanges;
            await settings.save();
        }
        
        res.status(200).json(settings);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update max search range
const updateMaxSearchRange = async (req, res) => {
    try {
        const { maxSearchRangeKm } = req.body;
        
        if (!maxSearchRangeKm || maxSearchRangeKm <= 0) {
            throw Error('المسافة القصوى يجب أن تكون أكبر من 0');
        }
        
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ maxSearchRangeKm });
        } else {
            settings.maxSearchRangeKm = maxSearchRangeKm;
            await settings.save();
        }
        
        res.status(200).json(settings);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update referral prize
const updateReferralPrize = async (req, res) => {
    try {
        const { referralPrize } = req.body;
        
        if (!referralPrize && referralPrize !== 0) {
            throw Error('قيمة الجائزة مطلوبة');
        }
        
        if (referralPrize < 0) {
            throw Error('قيمة الجائزة يجب أن تكون موجبة');
        }
        
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ referralPrize });
        } else {
            settings.referralPrize = referralPrize;
            await settings.save();
        }
        
        res.status(200).json(settings);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all packages
const getAllPackages = async (req, res) => {
    try {
        const packages = await Package.find().sort({ price: 1 });
        res.status(200).json(packages);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Create package
const createPackage = async (req, res) => {
    try {
        const {
            name,
            price,
            durationInDays,
            isThereDiscount,
            priceAfterDiscount,
            packageImage,
            description,
            badgeLabel,
            statusText,
            statusTone,
            ctaText,
            isActive
        } = req.body;
        
        if (!name || !price || !durationInDays || !packageImage) {
            throw Error('جميع الحقول المطلوبة يجب ملؤها');
        }
        
        if (price <= 0 || durationInDays <= 0) {
            throw Error('السعر والمدة يجب أن تكون أكبر من 0');
        }
        
        if (isThereDiscount && (!priceAfterDiscount || priceAfterDiscount >= price)) {
            throw Error('السعر بعد الخصم يجب أن يكون أقل من السعر الأصلي');
        }

        if (description && !Array.isArray(description)) {
            throw Error('الوصف يجب أن يكون قائمة نصوص');
        }
        
        // Upload image to AWS if it's base64
        let imageUrl = packageImage;
        if (packageImage.startsWith('data:image')) {
            imageUrl = await saveImageToAWS(packageImage);
        }
        
        const pkg = await Package.create({
            name,
            price,
            durationInDays,
            description: description || [],
            badgeLabel,
            statusText,
            statusTone,
            ctaText,
            isActive: isActive !== undefined ? isActive : true,
            isThereDiscount: isThereDiscount || false,
            priceAfterDiscount,
            packageImage: imageUrl
        });
        
        res.status(201).json(pkg);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update package
const updatePackage = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            price,
            durationInDays,
            isThereDiscount,
            priceAfterDiscount,
            packageImage,
            description,
            badgeLabel,
            statusText,
            statusTone,
            ctaText,
            isActive
        } = req.body;
        
        const package = await Package.findById(id);
        if (!package) {
            throw Error('الباقة غير موجودة');
        }
        
        if (price && price <= 0) {
            throw Error('السعر يجب أن يكون أكبر من 0');
        }
        
        if (durationInDays && durationInDays <= 0) {
            throw Error('المدة يجب أن تكون أكبر من 0');
        }
        
        if (isThereDiscount && priceAfterDiscount && priceAfterDiscount >= (price || package.price)) {
            throw Error('السعر بعد الخصم يجب أن يكون أقل من السعر الأصلي');
        }

        if (description !== undefined && !Array.isArray(description)) {
            throw Error('الوصف يجب أن يكون قائمة نصوص');
        }
        
        if (name) package.name = name;
        if (price) package.price = price;
        if (durationInDays) package.durationInDays = durationInDays;
        if (description !== undefined) package.description = description;
        if (badgeLabel !== undefined) package.badgeLabel = badgeLabel;
        if (statusText !== undefined) package.statusText = statusText;
        if (statusTone !== undefined) package.statusTone = statusTone;
        if (ctaText !== undefined) package.ctaText = ctaText;
        if (isActive !== undefined) package.isActive = isActive;
        if (isThereDiscount !== undefined) package.isThereDiscount = isThereDiscount;
        if (priceAfterDiscount) package.priceAfterDiscount = priceAfterDiscount;
        
        // Upload new image to AWS if it's base64
        if (packageImage) {
            if (packageImage.startsWith('data:image')) {
                package.packageImage = await saveImageToAWS(packageImage);
            } else {
                package.packageImage = packageImage;
            }
        }
        
        await package.save();
        
        res.status(200).json(package);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete package
const deletePackage = async (req, res) => {
    try {
        const { id } = req.params;
        
        const package = await Package.findByIdAndDelete(id);
        
        if (!package) {
            throw Error('الباقة غير موجودة');
        }
        
        res.status(200).json({ message: 'تم حذف الباقة بنجاح' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    getSettings,
    updatePriceRanges,
    updateMaxSearchRange,
    updateReferralPrize,
    getAllPackages,
    createPackage,
    updatePackage,
    deletePackage
};