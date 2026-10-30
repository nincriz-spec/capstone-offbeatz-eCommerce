-- categories (ids are 1 to 5 in this order)
insert into category (name, slug, is_customisable) values
    ('Shirts', 'shirts', 0),
    ('Caps', 'caps', 0),
    ('Jackets', 'jackets', 0),
    ('Cargo Pants', 'cargo', 0),
    ('Customized Uniforms', 'uniforms', 1);


-- products (ids are 1 to 11 in this order)
insert into product (category_id, name, price, fit) values
    (1, 'Offbeatz Signature Tee', 25, 'oversized'),
    (1, 'Don’t Be Stupid Tee', 25, 'oversized'),
    (1, 'Beatz Tee', 25, 'oversized'),
    (1, 'Skye Gaze', 25, 'oversized'),
    (1, 'OB Tee', 25, 'oversized'),
    (2, 'Trucker Cap', 15, 'regular'),
    (4, 'Cargo Pants', 30, 'regular'),
    (3, 'Bomber Jacket', 45, 'regular'),
    (5, 'Customized Basketball Uniform', 22, 'regular'),
    (5, 'Customized Football Uniform', 22, 'regular'),
    (5, 'Customized Pickleball Uniform', 22, 'regular');


-- variants
insert into variant (product_id, sku, size, color, stock_qty) values
    (1, 'SIG-BLK-L', 'L', 'Black', 10),
    (1, 'SIG-BLK-M', 'M', 'Black', 5),
    (1, 'SIG-BLK-S', 'S', 'Black', 5),
    (1, 'SIG-WHT-L', 'L', 'White', 4),
    (1, 'SIG-WHT-M', 'M', 'White', 8),
    (1, 'SIG-WHT-S', 'S', 'White', 5),

    (2, 'DBS-WHT-L', 'L', 'White', 10),
    (2, 'DBS-WHT-M', 'M', 'White', 5),
    (2, 'DBS-BLK-L', 'L', 'Black', 10),
    (2, 'DBS-BLK-M', 'M', 'Black', 8),
    (2, 'DBS-CRM-L', 'L', 'Cream', 10),
    (2, 'DBS-CRM-M', 'M', 'Cream', 10),

    (3, 'BTZ-WHT-L', 'L', 'White', 10),
    (3, 'BTZ-WHT-M', 'M', 'White', 5),
    (3, 'BTZ-BLK-L', 'L', 'Black', 10),
    (3, 'BTZ-BLK-M', 'M', 'Black', 8),
    (3, 'BTZ-CRM-L', 'L', 'Cream', 10),
    (3, 'BTZ-CRM-M', 'M', 'Cream', 10),

    (4, 'SKY-WHT-L', 'L', 'White', 2),

    (5, 'OBT-BLK-L', 'L', 'Black', 2),
    (5, 'OBT-BLK-M', 'M', 'Black', 5),
    (5, 'OBT-BLK-S', 'S', 'Black', 2),
    (5, 'OBT-CRM-L', 'L', 'Cream', 2),
    (5, 'OBT-CRM-M', 'M', 'Cream', 6),
    (5, 'OBT-CRM-S', 'S', 'Cream', 5),

    (6, 'CAP-BLK-OS', 'One size', 'Black', 10),
    (7, 'CRG-BLK-OS', 'One size', 'Black', 10),

    (8, 'JKT-RED-L', 'L', 'Red', 10),
    (8, 'JKT-CRM-M', 'M', 'Cream', 10);


-- uniform variants (these have a set and their own price)
insert into variant (product_id, sku, size, color, set_name, price, stock_qty) values
    (9, 'BSK-RED-M-TOP', 'M', 'Red', 'Top Only', 22, 12),
    (9, 'BSK-WHT-M-SET', 'M', 'White', 'Top + Shorts', 35, 12),
    (9, 'BSK-BLU-L-SET', 'L', 'Blue', 'Top + Shorts', 35, 12),

    (10, 'FBL-ARG-M-TOP', 'M', 'Argentina Blue', 'Top Only', 22, 2),
    (10, 'FBL-JPN-M-TOP', 'M', 'Japan Blue', 'Top Only', 22, 2),

    (11, 'PKB-WHT-M-TOP', 'M', 'White', 'Top Only', 22, 2),
    (11, 'PKB-BLU-M-TOP', 'M', 'Blue', 'Top Only', 22, 2),
    (11, 'PKB-RED-M-TOP', 'M', 'Red', 'Top Only', 22, 2);


-- images
insert into product_image (product_id, color, url, sort_order) values
    (1, 'Black', '/products/OBsignatureblack.jpg', 1),
    (1, 'White', '/products/OBsignaturewhite.jpg', 2),

    (2, 'Black', '/products/dontbestupid-tee-black.jpg', 1),
    (2, 'White', '/products/dontbestupid-tee-white.jpg', 2),
    (2, 'Cream', '/products/dontbestupid-tee-cream.jpg', 3),

    (3, 'Black', '/products/ob-black.jpg', 1),
    (3, 'White', '/products/ob-white.jpg', 2),
    (3, 'Cream', '/products/ob-cream.jpg', 3),

    (4, null, '/products/skyereyne.jpg', 1),

    (5, 'Cream', '/products/OBteecream.jpg', 1),
    (5, 'Black', '/products/OBteeblack.jpg', 2),

    (6, null, '/products/cap.jpg', 1),
    (7, null, '/products/cargopants.jpg', 1),

    (8, 'Cream', '/products/jacketcream.jpg', 1),
    (8, 'Red', '/products/jacketred.jpg', 2),

    (9, null, '/products/basketballuniform.jpg', 1),

    (10, 'Argentina Blue', '/products/argentinablue.jpg', 1),
    (10, 'Japan Blue', '/products/japanblue.jpg', 2),

    (11, null, '/products/pickleballuniform.jpg', 1);