Create database offbeatz;
Use offbeatz;


create table customer(
    customer_id  int unsigned not null auto_increment primary key,
    name  varchar(255) not null,
    email  varchar(255) not null unique,
    password  varchar(255) not null,   
    phone  varchar(50) not null,
    role  enum('customer','admin') not null default 'customer',   
    created_at  datetime not null default current_timestamp
) engine = innodb;


create table address(
    address_id  int unsigned not null auto_increment primary key,
    street  varchar(255) not null,
    block  varchar(255) not null,
    city  varchar(255) not null,
    postal_code  varchar(20) not null,
    customer_id  int unsigned not null,

    constraint fk_address_customer
    foreign key (customer_id) references customer(customer_id)
    on delete cascade
    on update restrict
) engine = innodb;


-- products

create table category(
    category_id  int unsigned not null auto_increment primary key,
    name  varchar(255) not null,
    slug  varchar(100) not null unique,   
    is_customisable  tinyint(1) not null default 0
) engine = innodb;


create table product(
    product_id  int unsigned not null auto_increment primary key,
    name  varchar(255) not null,
    description  text,
    price  decimal(10,2) not null,
    fit  enum('oversized','boxy','regular','slim') not null default 'regular',  
    fabric  varchar(80),   
    gsm  smallint unsigned,   
    gender  enum('men','women','unisex') not null default 'unisex',  
    drop_name  varchar(80),  
    care_instructions  varchar(255),  
    is_active  tinyint(1) not null default 1,  
    created_at  datetime not null default current_timestamp,  
    category_id  int unsigned not null,

    constraint fk_product_category
    foreign key (category_id) references category(category_id)
    on delete restrict
    on update restrict
) engine = innodb;


create table product_image(  
    product_image_id  int unsigned not null auto_increment primary key,
    url  varchar(500) not null,
    color  varchar(30),
    sort_order  int not null default 0,
    product_id  int unsigned not null,

    constraint fk_image_product
    foreign key (product_id) references product(product_id)
    on delete cascade
    on update restrict
) engine = innodb;


create table tag(  
    tag_id  int unsigned not null auto_increment primary key,
    name  varchar(50) not null unique
) engine = innodb;


create table product_tag(   
    product_id  int unsigned not null,
    tag_id  int unsigned not null,
    primary key (product_id, tag_id),

    constraint fk_ptag_product
    foreign key (product_id) references product(product_id)
    on delete cascade
    on update restrict,

    constraint fk_ptag_tag
    foreign key (tag_id) references tag(tag_id)
    on delete cascade
    on update restrict
) engine = innodb;


create table variant(
    variant_id  int unsigned not null auto_increment primary key,
    sku  varchar(50) not null unique,
    size  varchar(20),
    color  varchar(30),
    stock_qty  int unsigned not null default 0,
    set_name  varchar(30),   
    price  decimal(10,2) null,   
    product_id  int unsigned not null,

     unique key uq_variant_combo (product_id, size, color, set_name),

    constraint fk_variant_product
    foreign key (product_id) references product(product_id)
    on delete cascade
    on update restrict
) engine = innodb;


-- orders

create table orders(
    order_id  int unsigned not null auto_increment primary key,
    status  enum('pending','paid','shipped','delivered','cancelled')
            not null default 'pending',
    total  decimal(10,2) not null default 0.00,
    created_at  datetime not null default current_timestamp,
    customer_id  int unsigned not null,
    address_id  int unsigned not null,

    constraint fk_orders_customer
    foreign key (customer_id) references customer(customer_id)
    on delete restrict
    on update restrict,

    constraint fk_orders_address
    foreign key (address_id) references address(address_id)
    on delete restrict
    on update restrict
) engine = innodb;


create table order_item(
    order_item_id  int unsigned not null auto_increment primary key,
    quantity  int unsigned not null,
    unit_price  decimal(10,2) not null,   
    order_id  int unsigned not null,
    variant_id  int unsigned not null,

    constraint chk_item_qty check (quantity > 0),

    constraint fk_item_order
    foreign key (order_id) references orders(order_id)
    on delete cascade
    on update restrict,

    constraint fk_item_variant
    foreign key (variant_id) references variant(variant_id)
    on delete restrict
    on update restrict
) engine = innodb;


-- one custom design per order item (only for customised jerseys)
create table custom_design(
    custom_design_id  int unsigned not null auto_increment primary key,
    player_name  varchar(50),
    jersey_number  varchar(5),
    artwork_url  text,
    order_item_id  int unsigned not null unique,

    constraint fk_design_item
    foreign key (order_item_id) references order_item(order_item_id)
    on delete cascade
    on update restrict
) engine = innodb;


create table payment(
    payment_id  int unsigned not null auto_increment primary key,
    method  varchar(30) not null,
    amount  decimal(10,2) not null,
    status  varchar(20) not null default 'pending',
    stripe_payment_id  varchar(255) null,  
    created_at  datetime not null default current_timestamp,  
    order_id  int unsigned not null,

    constraint fk_payment_order
    foreign key (order_id) references orders(order_id)
    on delete restrict
    on update restrict
) engine = innodb;


-- added: audit trail and login security

create table order_status_history(
    history_id  int unsigned not null auto_increment primary key,
    from_status  enum('pending','paid','shipped','delivered','cancelled') null,
    to_status  enum('pending','paid','shipped','delivered','cancelled') not null,
    changed_at  datetime not null default current_timestamp,
    order_id  int unsigned not null,
    changed_by  int unsigned null,

    constraint fk_history_order
    foreign key (order_id) references orders(order_id)
    on delete cascade
    on update restrict,

    constraint fk_history_user
    foreign key (changed_by) references customer(customer_id)
    on delete set null
    on update restrict
) engine = innodb;

-- ---------------------------------------------------------
-- AI assistant (RAG): uploaded PDFs and their text chunks
-- ---------------------------------------------------------

create table pdf (
  pdf_id int unsigned not null auto_increment primary key,
  filename varchar(255) not null,
  original_filename varchar(255) not null,
  file_path varchar(500) not null,
  file_size int default null,
  upload_date datetime default current_stamp,

)engine = innodb;

create table pdf_chunk (
  chunk_id int unsigned not null auto_increment, primary key,
  pdf_id int unsigned not null,
  chunk_text text not null,
  chunk_order int not null,
  embedding vector(768) not null,
  created_at timestamp null default current_stamp,
  
  KEY idx_pdf_id (pdf_id),
  VECTOR KEY (embedding) DISTANCE=cosine,

  constraint fk_chunk_pdf 
  foreign key (pdf_id) references pdf (pdf_id) 
  on delete cascade
)engine = innodb;

-- each product can have one PDF for the assistant
alter table product
add colomn pdf_id int unsigned default null,
add key fk_product_pdf (pdf_id),
add constraint fk_product_pdf
foreign key (pdf_id) references pdf(pdf_id)
on delete set null;

-- JWT logout: tokens that can no longer be used
create table token_blacklist(
    token varchar(512) primary key,
    expires_at datetime
) engine = innodb;
