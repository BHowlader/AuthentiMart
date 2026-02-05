// Script to update product image paths
const fs = require('fs');
const path = require('path');

const imageMap = {
    4: 'product_04_laneige_lip_mask.png',
    5: 'product_05_maybelline_superstay.png',
    6: 'product_06_maybelline_liner.png',
    8: 'product_08_maybelline_mascara.png',
    10: 'product_10_ardell_lashes.png',
    12: 'product_12_missha_bb_cream.png',
    14: 'product_14_rare_beauty_blush.png', // Missing - needs to be generated
    16: 'product_16_cosrx_snail_essence.png',
    18: 'product_18_cosrx_pimple_patch.png',
    19: 'product_19_boj_glow_serum.png',
    20: 'product_20_cosrx_cleanser.png',
    21: 'product_21_sheet_mask_bundle.png',
    22: 'product_22_ordinary_niacinamide.png',
    23: 'product_23_cerave_cream.png',
    24: 'product_24_gatsby_wax.png',
    25: 'product_25_lattafa_perfume.png',
    26: 'product_26_leather_wallet.png',
    27: 'product_27_card_holder.png',
    28: 'product_28_nivea_facewash.png',
    29: 'product_29_redmi_buds.png',
    30: 'product_30_haylou_gt7.png',
    31: 'product_31_baseus_powerbank.png',
    32: 'product_32_usbc_charger.png',
    33: 'product_33_phone_cases.png',
    34: 'product_34_screen_protector.png',
    35: 'product_35_baseus_slim_powerbank.png',
    36: 'product_36_gan_charger.png',
    37: 'product_37_gaming_mouse.png',
    38: 'product_38_mouse_pad.png',
    39: 'product_39_rgb_led_strip.png',
    40: 'product_40_air_fryer.png',
    41: 'product_41_pressure_cooker.png',
    42: 'product_42_electric_kettle.png',
    43: 'product_43_desk_lamp.png',
    44: 'product_44_fairy_lights.png',
    45: 'product_45_decorative_showpiece.png',
    46: 'product_46_scented_candles.png',
    47: 'product_47_artificial_plant.png',
    48: 'product_48_beauty_blenders.png',
    49: 'product_49_makeup_brushes.png',
    50: 'product_50_jade_roller_set.png',
};

console.log('Images you have generated (40 total):');
Object.entries(imageMap).forEach(([id, filename]) => {
    console.log(`Product ${id}: ${filename}`);
});

console.log('\n\nMissing images (need to be generated):');
const missingProducts = [1, 2, 3, 7, 9, 11, 13, 14, 15, 17];
missingProducts.forEach(id => {
    console.log(`Product ${id}: MISSING`);
});
