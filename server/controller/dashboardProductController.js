const fs = require('fs');
const path = require('path');
const productAdminService = require('../services/productAdminService');
const ragService = require('../services/ragService');

// Same folder the old React admin upload used: server/uploads
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

const emptyProduct = {
  name: '',
  description: '',
  price: '',
  fit: 'regular',
  fabric: '',
  gsm: '',
  gender: 'unisex',
  drop_name: '',
  care_instructions: '',
  category_id: '',
};

// Read the one-time message and forget it
function takeFlash(req) {
  const flash = req.session.flash || null;
  delete req.session.flash;
  return flash;
}

// Shows the add/edit form (used by several functions below)
async function renderForm(req, res, options) {
  try {
    const categories = await productAdminService.getCategories();
    res.status(options.status || 200).render('dashboard/product_form', {
      title: options.heading,
      admin: req.session.admin,
      heading: options.heading,
      action: options.action,
      product: options.product,
      productId: options.productId || null,
      categories,
      fitOptions: ['oversized', 'boxy', 'regular', 'slim'],
      genderOptions: ['men', 'women', 'unisex'],
      error: options.error || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Could not load the form');
  }
}

async function showProducts(req, res) {
  try {
    const products = await productAdminService.listProducts();
    res.render('dashboard/products', {
      title: 'Products',
      admin: req.session.admin,
      products,
      flash: takeFlash(req),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Could not load products');
  }
}

function showNewForm(req, res) {
  return renderForm(req, res, {
    heading: 'Add product',
    action: '/dashboard/products',
    product: emptyProduct,
  });
}

async function createProduct(req, res) {
  try {
    await productAdminService.createProduct(req.body);
    req.session.flash = { type: 'success', text: 'Product added. It is hidden until you show it.' };
    res.redirect('/dashboard/products');
  } catch (err) {
    // Show the form again with what the admin typed and the error message
    return renderForm(req, res, {
      status: 400,
      heading: 'Add product',
      action: '/dashboard/products',
      product: req.body,
      error: err.message,
    });
  }
}

async function showEditForm(req, res) {
  const productId = Number(req.params.id);
  try {
    const product = await productAdminService.getProduct(productId);
    return renderForm(req, res, {
      heading: 'Edit product',
      action: '/dashboard/products/' + productId,
      product,
      productId,
    });
  } catch (err) {
    req.session.flash = { type: 'danger', text: err.message };
    res.redirect('/dashboard/products');
  }
}

async function updateProduct(req, res) {
  const productId = Number(req.params.id);
  try {
    await productAdminService.updateProduct(productId, req.body);
    req.session.flash = { type: 'success', text: 'Product #' + productId + ' updated' };
    res.redirect('/dashboard/products');
  } catch (err) {
    return renderForm(req, res, {
      status: 400,
      heading: 'Edit product',
      action: '/dashboard/products/' + productId,
      product: req.body,
      productId,
      error: err.message,
    });
  }
}

async function toggleActive(req, res) {
  const productId = Number(req.params.id);
  const makeActive = req.body.active === '1';
  try {
    await productAdminService.setActive(productId, makeActive);
    req.session.flash = {
      type: 'success',
      text: 'Product #' + productId + (makeActive ? ' is now visible' : ' is now hidden'),
    };
  } catch (err) {
    req.session.flash = { type: 'danger', text: err.message };
  }
  res.redirect('/dashboard/products');
}

// Returns a message if the file is not OK, or null if it is fine
function checkPdfFile(file) {
  if (!file) {
    return 'Please choose a PDF file';
  }
  if (file.mimetype !== 'application/pdf') {
    return 'Only PDF files are allowed';
  }
  if (file.truncated) {
    return 'The PDF is too big (max 5 MB)';
  }
  return null;
}

async function uploadPdf(req, res) {
  const productId = Number(req.params.id);

  try {
    // Make sure the product exists (throws if not)
    await productAdminService.getProduct(productId);

    const file = req.files && req.files.pdf;
    const problem = checkPdfFile(file);
    if (problem) {
      req.session.flash = { type: 'danger', text: problem };
      return res.redirect('/dashboard/products');
    }

    // Save with a safe name we choose ourselves, never the name the user sent
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const savedName = Date.now() + '.pdf';
    const savedPath = path.join(UPLOAD_DIR, savedName);
    await file.mv(savedPath);

    // Same RAG code as before: chunk, embed, store
    await ragService.ingestPdf(savedPath, savedName, file.name, file.size, productId);

    req.session.flash = { type: 'success', text: 'PDF uploaded for product #' + productId + '. The assistant can use it now.' };
  } catch (err) {
    console.error(err);
    req.session.flash = { type: 'danger', text: 'Could not process the PDF. Please try again.' };
  }

  res.redirect('/dashboard/products');
}

module.exports = {
  showProducts,
  showNewForm,
  createProduct,
  showEditForm,
  updateProduct,
  toggleActive,
  uploadPdf,
};