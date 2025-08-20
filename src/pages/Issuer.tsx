import asyncio
from flask import Flask, request, jsonify, make_response
import logging
import requests
import json
import os
from datetime import datetime
from io import BytesIO
import hashlib
import uuid
import base64

# Configure logging first
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Aptos SDK imports
try:
    from aptos_sdk.async_client import RestClient
    from aptos_sdk.account import Account
    from aptos_sdk.transactions import EntryFunction, TransactionArgument, TransactionPayload
    from aptos_sdk.bcs import Serializer
    APTOS_SDK_AVAILABLE = True
    logger.info("✅ aptos-sdk async_client imported successfully")
except ImportError as e:
    APTOS_SDK_AVAILABLE = False
    logger.warning(f"aptos-sdk not available: {e}. Blockchain integration will be skipped.")

# Other dependencies
try:
    from pymongo import MongoClient
    from bson import ObjectId
except Exception:
    MongoClient = None
    ObjectId = None
    logger.warning("pymongo not available. MongoDB integration will be skipped.")

try:
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.pdfgen import canvas
    from reportlab.lib import colors
    from reportlab.lib.units import mm
    from reportlab.lib.utils import ImageReader
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
except Exception:
    canvas = None
    logger.warning("reportlab not available. PDF generation will be skipped.")

try:
    import smtplib
    from email.message import EmailMessage
except Exception:
    smtplib = None
    logger.warning("smtplib not available. Email sending will be skipped.")

try:
    from PIL import Image, ImageDraw, ImageFont
except Exception:
    Image = None
    logger.warning("PIL not available. Image processing will be skipped.")

try:
    import qrcode
except Exception:
    qrcode = None
    logger.warning("qrcode not available. QR code generation will be skipped.")

try:
    import cloudinary
    import cloudinary.uploader
except Exception:
    cloudinary = None
    logger.warning("cloudinary not available. Cloudinary uploads will be skipped.")

app = Flask(__name__)

# Configure CORS
from flask_cors import CORS
CORS(app, 
     origins=["https://ogtechminds.vercel.app", "http://localhost:3000"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "Accept", "X-Admin-Secret"],
     supports_credentials=True,
     max_age=600)

# Ensure CORS headers for error responses
@app.errorhandler(Exception)
def handle_error(error):
    logger.error(f"Unhandled error: {str(error)}")
    response = jsonify({"error": str(error)})
    response.status_code = 500
    response.headers.add('Access-Control-Allow-Origin', 'https://ogtechminds.vercel.app')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,X-Admin-Secret')
    return response

# Load .env
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
except Exception:
    logger.warning("python-dotenv not available or .env file missing.")

# Aptos configuration
APTOS_NODE_URL = "https://fullnode.devnet.aptoslabs.com/v1"
ACCOUNT_ADDRESS = "0x40a2252431edcfa7375a82da9f924a918a9f430da790f1b0db38556d5e17cd39"
MODULE_NAME = "certificate_verifier"

# MongoDB configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://Mahesh00234h:Raone@cluster0.tzacr8w.mongodb.net/og_techminds?retryWrites=true&w=majority")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "og_techminds")
MONGO_COLLECTION = os.getenv("MONGO_COLLECTION", "profiles")

mongo_client = None
mongo_db = None
mongo_collection = None
if MongoClient is not None:
    try:
        mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        mongo_db = mongo_client.get_database(MONGO_DB_NAME)
        mongo_collection = mongo_db.get_collection(MONGO_COLLECTION)
        mongo_collection.create_index("name")
        mongo_db.get_collection('certificates').create_index("cert_id")
        mongo_client.admin.command('ping')
        logger.info(f"✅ MongoDB connected: db={MONGO_DB_NAME} coll={MONGO_COLLECTION}")
    except Exception as e:
        logger.error(f"⚠️ MongoDB not initialized: {e}")

# App URLs
BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "https://certi-og-backend.onrender.com")
FRONTEND_VERIFY_URL = os.getenv("FRONTEND_VERIFY_URL", "https://certi-og-backend.onrender.com/verify/hash/")
CLUB_LOGO_URL = os.getenv("CLUB_LOGO_URL", "https://res.cloudinary.com/dxu2xavnq/image/upload/v1750839403/favicon_bcvqnp.png")
STAMP_URL = os.getenv("STAMP_URL", "https://res.cloudinary.com/dxu2xavnq/image/upload/v1755609347/WhatsApp_Image_2025-08-19_at_18.36.37_602c3cfd_dujvzl.png")

# SMTP configuration
SMTP_HOST = os.getenv("SMTP_HOST") or os.getenv("MAIL_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT") or os.getenv("MAIL_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER") or os.getenv("MAIL_USERNAME")
SMTP_PASS = os.getenv("SMTP_PASS") or os.getenv("MAIL_PASSWORD")
SMTP_FROM = os.getenv("SMTP_FROM") or (SMTP_USER or "no-reply@ogtechminds.local")

# Cloudinary configuration
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")
if cloudinary is not None and CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET:
    try:
        cloudinary.config(
            cloud_name=CLOUDINARY_CLOUD_NAME,
            api_key=CLOUDINARY_API_KEY,
            api_secret=CLOUDINARY_API_SECRET
        )
        logger.info("✅ Cloudinary configured")
    except Exception as e:
        logger.error(f"⚠️ Cloudinary config failed: {e}")

class AptosCertificateIssuer:
    def __init__(self):
        self.node_url = APTOS_NODE_URL
        self.account_address = ACCOUNT_ADDRESS
        if not APTOS_SDK_AVAILABLE:
            logger.warning("Aptos SDK not available. Blockchain operations will be skipped.")
            self.client = None
            self.account = None
            return
        try:
            self.client = RestClient(self.node_url)
            private_key_hex = os.getenv("APTOS_PRIVATE_KEY")
            if not private_key_hex:
                logger.error("APTOS_PRIVATE_KEY not set in environment")
                self.client = None
                self.account = None
                return
            self.account = Account.load_key(private_key_hex)
            logger.info(f"✅ Aptos async client initialized for account: {self.account.address()}")
        except Exception as e:
            logger.error(f"Failed to initialize Aptos client: {e}")
            self.client = None
            self.account = None

    async def test_network_connection(self):
        networks = {
            "testnet": "https://fullnode.testnet.aptoslabs.com/v1",
            "mainnet": "https://fullnode.mainnet.aptoslabs.com/v1",
            "devnet": "https://fullnode.devnet.aptoslabs.com/v1"
        }
        for network_name, url in networks.items():
            try:
                logger.info(f"Testing {network_name}...")
                resource_type = f"{self.account_address}::{MODULE_NAME}::CertificateCollection"
                response = requests.get(f"{url}/accounts/{self.account_address}/resource/{resource_type}", timeout=3)
                if response.status_code == 200:
                    logger.info(f"✅ Module found on {network_name}!")
                    self.node_url = url
                    return network_name
                else:
                    logger.info(f"❌ {network_name}: {response.status_code}")
            except Exception as e:
                logger.info(f"❌ {network_name} error: {e}")
        return None

    async def get_account_info(self):
        if not APTOS_SDK_AVAILABLE or not self.client:
            logger.warning("Aptos SDK or client not available")
            return None
        try:
            response = requests.get(f"{self.node_url}/accounts/{self.account_address}", timeout=3)
            return response.json()
        except Exception as e:
            logger.error(f"Error getting account info: {e}")
            return None

    async def get_module_data(self):
        if not APTOS_SDK_AVAILABLE or not self.client:
            logger.warning("Aptos SDK or client not available")
            return None
        try:
            response = requests.get(f"{self.node_url}/accounts/{self.account_address}/resource/0x1::code::PackageRegistry", timeout=3)
            return response.json()
        except Exception as e:
            logger.error(f"Error getting module data: {e}")
            return None

    async def get_certificate_collection(self):
        if not APTOS_SDK_AVAILABLE or not self.client:
            logger.warning("Aptos SDK or client not available")
            return None
        try:
            resource_type = f"{self.account_address}::{MODULE_NAME}::CertificateCollection"
            response = await self.client.get_resource(self.account_address, resource_type)
            logger.info(f"Certificate Collection Response: {response}")
            return response
        except Exception as e:
            logger.error(f"Error getting certificate collection: {e}")
            return None

    async def get_certificate_counter(self):
        if not APTOS_SDK_AVAILABLE or not self.client:
            logger.warning("Aptos SDK or client not available")
            return None
        try:
            resource_type = f"{self.account_address}::{MODULE_NAME}::CertificatesCounter"
            response = await self.client.get_resource(self.account_address, resource_type)
            logger.info(f"Certificate Counter Response: {response}")
            return response
        except Exception as e:
            logger.error(f"Error getting certificate counter: {e}")
            return None

    async def issue_certificate(self, recipient: str, issuer: str, pdf_hash: str):
        if not APTOS_SDK_AVAILABLE or not self.client or not self.account:
            logger.warning("Aptos SDK or client not available. Skipping blockchain issuance.")
            return "skipped: Aptos SDK or client not available"
        try:
            start_time = time.time()
            payload = EntryFunction.natural(
                f"{self.account_address}::{MODULE_NAME}",
                "issue_certificate",
                [],
                [
                    TransactionArgument(recipient, Serializer.str),
                    TransactionArgument(issuer, Serializer.str),
                    TransactionArgument(pdf_hash, Serializer.str),
                ]
            )
            signed_txn = await self.client.create_bcs_signed_transaction(self.account, TransactionPayload(payload))
            tx_hash = await self.client.submit_bcs_transaction(signed_txn)
            await self.client.wait_for_transaction(tx_hash)
            logger.info(f"Blockchain transaction successful: {tx_hash} (took {time.time() - start_time:.2f}s)")
            return tx_hash
        except Exception as e:
            logger.error(f"Error issuing certificate on blockchain: {e}")
            return f"failed: {str(e)}"

# Initialize Aptos client
aptos_client = AptosCertificateIssuer()

_fonts_loaded = False

def _ensure_fonts_loaded():
    global _fonts_loaded
    if _fonts_loaded:
        return
    try:
        font_dir = os.path.join(os.path.dirname(__file__), 'fonts')
        mont_path = os.path.join(font_dir, 'Montserrat-Bold.ttf')
        roboto_path = os.path.join(font_dir, 'RobotoSerif-Regular.ttf')
        if os.path.exists(mont_path) and os.path.exists(roboto_path):
            pdfmetrics.registerFont(TTFont('Montserrat-Bold', mont_path))
            pdfmetrics.registerFont(TTFont('RobotoSerif-Regular', roboto_path))
            logger.info("Registered local fonts: Montserrat-Bold, RobotoSerif-Regular")
        else:
            raise FileNotFoundError("Local font files not found")
    except Exception as e:
        logger.warning(f"Failed to register local fonts: {e}. Using built-in fonts.")
        try:
            pdfmetrics.registerFont(TTFont('Helvetica', 'Helvetica'))
            pdfmetrics.registerFont(TTFont('Times-Roman', 'Times-Roman'))
            logger.info("Using fallback fonts: Helvetica, Times-Roman")
        except Exception as e2:
            logger.error(f"Failed to register fallback fonts: {e2}. Using reportlab defaults.")
    _fonts_loaded = True

def _draw_gradient_background(c, width, height, start_rgb=(14/255,165/255,233/255), end_rgb=(139/255,92/255,246/255)):
    steps = 80
    for i in range(steps):
        t = i / (steps - 1)
        r = start_rgb[0] * (1 - t) + end_rgb[0] * t
        g = start_rgb[1] * (1 - t) + end_rgb[1] * t
        b = start_rgb[2] * (1 - t) + end_rgb[2] * t
        c.setFillColorRGB(r, g, b)
        y = height * (i / steps)
        c.rect(0, y, width, height / steps + 1, fill=True, stroke=False)

def _generate_certificate_pdf(
    user: dict,
    event_name: str,
    issuer_name: str,
    verify_url: str,
    cert_id: int | None = None,
    cert_type: str | None = None,
    prize: str | None = None,
    placement: str | None = None,
) -> bytes:
    if canvas is None:
        raise RuntimeError("PDF generation library not available")
    _ensure_fonts_loaded()
    width, height = landscape(A4)
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=landscape(A4))

    # Gradient background
    _draw_gradient_background(c, width, height)

    # Header: Logo next to header text + underline
    logo_w, logo_h = 80, 80
    logo_drawn = False
    try:
        if CLUB_LOGO_URL:
            resp_logo = requests.get(CLUB_LOGO_URL, timeout=10)
            if resp_logo.status_code == 200:
                logo_reader = ImageReader(BytesIO(resp_logo.content))
                c.drawImage(logo_reader, 60, height - 100, width=logo_w, height=logo_h, mask='auto')
                logo_drawn = True
    except Exception:
        pass
    c.setStrokeColor(colors.whitesmoke)
    c.setLineWidth(2)
    c.line(40, height - 105, width - 40, height - 105)

    c.setFillColor(colors.whitesmoke)
    try:
        c.setFont("Montserrat-Bold", 34)
    except Exception:
        c.setFont("Helvetica", 34)
    header_x = 60 + (logo_w + 20 if logo_drawn else 0)
    c.drawString(header_x, height - 80, "Certificate of Achievement")

    # Avatar (if available)
    avatar_url = user.get('avatar') or user.get('avatarUrl') or user.get('profilePic')
    img_x, img_y = width - 240, height - 280
    try:
        if avatar_url:
            resp = requests.get(avatar_url, timeout=10)
            if resp.status_code == 200:
                avatar_reader = ImageReader(BytesIO(resp.content))
                aw, ah = avatar_reader.getSize()
                max_w, max_h = 160, 160
                scale = min(max_w/aw, max_h/ah)
                draw_w, draw_h = aw*scale, ah*scale
                c.drawImage(avatar_reader, img_x, img_y, width=draw_w, height=draw_h, mask='auto')
    except Exception:
        pass

    # Body text
    c.setFillColor(colors.whitesmoke)
    try:
        c.setFont("RobotoSerif-Regular", 16)
    except Exception:
        c.setFont("Times-Roman", 16)
    c.drawString(70, height - 220, "This is to certify that")
    try:
        c.setFont("Montserrat-Bold", 42)
    except Exception:
        c.setFont("Helvetica", 42)
    c.drawString(70, height - 270, user.get('name', 'Participant'))
    try:
        c.setFont("RobotoSerif-Regular", 18)
    except Exception:
        c.setFont("Times-Roman", 18)
    c.drawString(70, height - 300, f"for successfully completing {event_name}.")

    # Enhanced paragraph with user info
    try:
        c.setFont("RobotoSerif-Regular", 13)
    except Exception:
        c.setFont("Times-Roman", 13)
    para_top = height - 340
    text = c.beginText(70, para_top)
    text.setFillColor(colors.whitesmoke)
    text.setLeading(18)
    def wrap_lines(s: str, max_w: float, font_name: str, font_size: int):
        words = s.split()
        lines = []
        line = ''
        for w in words:
            trial = (line + ' ' + w).strip()
            try:
                wlen = pdfmetrics.stringWidth(trial, font_name, font_size)
            except Exception:
                wlen = pdfmetrics.stringWidth(trial, 'Times-Roman', font_size)
            if wlen <= max_w:
                line = trial
            else:
                if line:
                    lines.append(line)
                line = w
        if line:
            lines.append(line)
        return lines
    type_line = f"{cert_type}" if cert_type else "Participation"
    prize_line = f" and achieved {prize}" if prize else ""
    place_line = f" securing {placement}" if placement else ""
    paragraph = (
        f"{user.get('name','Participant')} from {user.get('department','Department')}, {user.get('year','Year')}, "
        f"has been awarded this {type_line} certificate for successfully completing {event_name}{prize_line}{place_line} with OGTECHMINDS. "
        f"This certificate is registered on the Aptos Blockchain and can be verified using the QR code. "
        f"Official contact email: {user.get('email','')}"
    )
    max_text_w = width - 70 - 260
    font_name = 'RobotoSerif-Regular'
    font_size = 13
    for ln in wrap_lines(paragraph, max_text_w, font_name, font_size):
        text.textLine(ln)
    c.drawText(text)

    # Stamp
    try:
        if STAMP_URL:
            resp_stamp = requests.get(STAMP_URL, timeout=10)
            if resp_stamp.status_code == 200:
                stamp_reader = ImageReader(BytesIO(resp_stamp.content))
                sw, sh = stamp_reader.getSize()
                max_sw, max_sh = 180, 110
                sscale = min(max_sw/sw, max_sh/sh)
                draw_sw, draw_sh = sw*sscale, sh*sscale
                c.drawImage(stamp_reader, 360, 60, width=draw_sw, height=draw_sh, mask='auto')
    except Exception:
        pass
    c.setFillColor(colors.whitesmoke)
    try:
        c.setFont("RobotoSerif-Regular", 10)
    except Exception:
        c.setFont("Times-Roman", 10)
    c.drawString(70, 80, "OGTECHMINDS • ogtechminds.vercel.app")

    # QR Code
    if qrcode is not None:
        qr = qrcode.make(verify_url)
        qr_buffer = BytesIO()
        qr.save(qr_buffer, format='PNG')
        qr_reader = ImageReader(BytesIO(qr_buffer.getvalue()))
        c.drawImage(qr_reader, width - 170, 70, width=130, height=130, mask='auto')
        c.setFillColor(colors.whitesmoke)
        try:
            c.setFont("RobotoSerif-Regular", 9)
        except Exception:
            c.setFont("Times-Roman", 9)
        c.drawString(width - 170, 60, "Verify on Aptos Blockchain")
        if cert_id is not None:
            try:
                c.setFont("RobotoSerif-Regular", 10)
            except Exception:
                c.setFont("Times-Roman", 10)
            c.drawCentredString(width - 105, 48, f"Certificate ID: {cert_id}")

    # Footer
    c.setFillColor(colors.whitesmoke)
    try:
        c.setFont("RobotoSerif-Regular", 9)
    except Exception:
        c.setFont("Times-Roman", 9)
    c.drawString(70, 40, f"Issued on {datetime.utcnow().strftime('%Y-%m-%d')} • OGTECHMINDS")

    c.showPage()
    c.save()
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

def _email_certificate(to_email: str, recipient_name: str, attachment_bytes: bytes, cert_id: int | None, filename: str = "certificate.png"):
    if smtplib is None:
        raise RuntimeError("SMTP library not available")
    if not (SMTP_HOST and SMTP_USER and SMTP_PASS and SMTP_FROM):
        raise RuntimeError("SMTP configuration missing (set SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM)")

    msg = EmailMessage()
    msg["Subject"] = "🎉 Congratulations! Your Official OGTECHMINDS Certificate is Here"
    msg["From"] = SMTP_FROM
    msg["To"] = to_email
    body = f"""
We are delighted to recognize your achievement through this officially issued blockchain-backed certificate from OGTECHMINDS. This certificate validates your successful completion of the program and serves as a permanent record of your skills and dedication. To ensure authenticity and trust, each certificate is securely registered on the Aptos Blockchain and embedded with a unique QR code for instant verification.

Your personalized certificate is attached to this email, reflecting your efforts and commitment to learning. At OGTECHMINDS, we believe in empowering talent and fostering innovation, and we are proud to celebrate your accomplishment as part of our growing community.

Keep learning, keep building – and continue your journey with us at https://ogtechminds.vercel.app/ 🚀

Warm regards,
Team OGTECHMINDS
""".strip()
    msg.set_content(body)
    maintype, subtype = ("image", "png") if filename.lower().endswith(".png") else ("application", "pdf")
    msg.add_attachment(attachment_bytes, maintype=maintype, subtype=subtype, filename=filename)

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)

@app.route('/')
def home():
    return jsonify({
        "message": "Certificate Verifier API",
        "status": "running",
        "blockchain": "Aptos",
        "module_address": ACCOUNT_ADDRESS
    })

@app.route('/status')
def status():
    try:
        module_data = asyncio.run(aptos_client.get_module_data())
        cert_collection = asyncio.run(aptos_client.get_certificate_collection())
        cert_counter = asyncio.run(aptos_client.get_certificate_counter())
        
        if module_data and cert_collection and cert_counter:
            return jsonify({
                "status": "running",
                "blockchain_connected": True,
                "module_deployed": True,
                "certificates_issued": cert_counter.get("data", {}).get("count", 0),
                "module_address": ACCOUNT_ADDRESS,
                "timestamp": datetime.now().isoformat()
            })
        else:
            return jsonify({
                "status": "error",
                "blockchain_connected": False,
                "module_deployed": False,
                "error": "Cannot access module on blockchain"
            })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/certificates', methods=['GET'])
def get_certificates():
    try:
        cert_collection = asyncio.run(aptos_client.get_certificate_collection())
        if cert_collection and "data" in cert_collection:
            blockchain_certs = cert_collection["data"]["certificates"]
        else:
            blockchain_certs = []
        
        return jsonify({
            "certificates": blockchain_certs,
            "total": len(blockchain_certs),
            "blockchain_count": len(blockchain_certs)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/certificates/<int:cert_id>', methods=['GET'])
def get_certificate(cert_id):
    try:
        cert_collection = asyncio.run(aptos_client.get_certificate_collection())
        if cert_collection and "data" in cert_collection:
            certificates = cert_collection["data"]["certificates"]
            for cert in certificates:
                if cert["id"] == cert_id:
                    return jsonify({
                        "certificate": cert,
                        "verified": True
                    })
            return jsonify({"verified": False, "message": "Certificate not found"})
        else:
            return jsonify({"verified": False, "message": "No certificates found"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/verify/<int:cert_id>', methods=['GET'])
def verify_certificate(cert_id):
    try:
        logger.info(f"Verifying certificate ID: {cert_id}")
        cert_collection = asyncio.run(aptos_client.get_certificate_collection())
        logger.info(f"Blockchain cert collection: {cert_collection}")
        
        if cert_collection and "data" in cert_collection:
            blockchain_certificates = cert_collection["data"]["certificates"]
            logger.info(f"Found {len(blockchain_certificates)} blockchain certificates")
            
            for cert in blockchain_certificates:
                logger.info(f"Checking blockchain cert ID: {cert['id']} (type: {type(cert['id'])}) vs search ID: {cert_id}")
                if cert["id"] == cert_id or str(cert["id"]) == str(cert_id) or int(cert["id"]) == int(cert_id):
                    logger.info(f"Blockchain certificate found!")
                    extra = {}
                    try:
                        if mongo_db is not None:
                            extra_col = mongo_db.get_collection('certificates')
                            doc = extra_col.find_one({"cert_id": int(cert_id)})
                            if doc:
                                extra["cloudinary_url"] = doc.get("cloudinary_url")
                                extra["token"] = doc.get("token")
                    except Exception:
                        pass
                    return jsonify({
                        "verified": True,
                        "certificate": cert,
                        "message": "Certificate is valid (blockchain)",
                        "source": "blockchain",
                        "pdf_url": f"{BACKEND_BASE_URL}/certificate-pdf/{int(cert_id)}",
                        **({"cloudinary_url": extra.get("cloudinary_url")} if extra.get("cloudinary_url") else {})
                    })
        
        logger.warning(f"No certificate found for ID: {cert_id} in blockchain")
        return jsonify({
            "verified": False,
            "message": "Certificate not found on blockchain",
            "searched_in": ["blockchain"]
        })
    except Exception as e:
        logger.error(f"Error in verification: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/stats', methods=['GET'])
def get_stats():
    try:
        cert_collection = asyncio.run(aptos_client.get_certificate_collection())
        cert_counter = asyncio.run(aptos_client.get_certificate_counter())
        
        total_certificates = cert_counter.get("data", {}).get("count", 0) if cert_counter else 0
        certificates = cert_collection.get("data", {}).get("certificates", []) if cert_collection else []
        
        issuer_stats = {}
        for cert in certificates:
            issuer = cert.get("issuer", "Unknown")
            issuer_stats[issuer] = issuer_stats.get(issuer, 0) + 1
        
        return jsonify({
            "total_certificates": total_certificates,
            "certificates_issued": len(certificates),
            "issuer_distribution": issuer_stats,
            "module_address": ACCOUNT_ADDRESS,
            "last_updated": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/issue', methods=['POST'])
def issue_certificate():
    try:
        data = request.get_json()
        recipient = data.get('recipient')
        issuer = data.get('issuer')
        pdf_hash = data.get('pdf_hash')
        
        if not all([recipient, issuer, pdf_hash]):
            return jsonify({"error": "Missing required fields"}), 400

        logger.info(f"Attempting to issue certificate: Recipient={recipient}, Issuer={issuer}, PDF Hash={pdf_hash}")
        
        cert_counter = asyncio.run(aptos_client.get_certificate_counter())
        new_cert_id = int(cert_counter["data"].get("count", 0)) if cert_counter and "data" in cert_counter else 0
        
        blockchain_status = asyncio.run(aptos_client.issue_certificate(recipient, issuer, pdf_hash))
        
        if blockchain_status.startswith("failed:") or blockchain_status.startswith("skipped:"):
            logger.error(f"Blockchain transaction failed: {blockchain_status}")
            return jsonify({
                "error": "Blockchain transaction failed",
                "details": blockchain_status,
                "note": "Certificate not added to blockchain."
            }), 500

        time.sleep(3)  # Wait for transaction to settle
        
        cert_collection = asyncio.run(aptos_client.get_certificate_collection())
        new_cert = None
        if cert_collection and "data" in cert_collection:
            certificates = cert_collection["data"].get("certificates", [])
            for cert in certificates:
                if (cert.get("recipient") == recipient and 
                    cert.get("issuer") == issuer and 
                    cert.get("pdf_hash") == pdf_hash):
                    new_cert = cert
                    break
        
        if new_cert:
            return jsonify({
                "message": "Certificate issued successfully on blockchain!",
                "certificate": new_cert,
                "transaction": blockchain_status,
                "note": "Certificate is now permanently stored on Aptos blockchain"
            })
        else:
            return jsonify({
                "message": "Transaction successful but certificate not found in collection",
                "certificate": {
                    "id": new_cert_id,
                    "recipient": recipient,
                    "issuer": issuer,
                    "pdf_hash": pdf_hash,
                    "status": "pending_verification"
                },
                "note": "Transaction completed. Certificate may take time to appear."
            })

    except Exception as e:
        logger.error(f"Error in /issue: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/users', methods=['GET'])
def list_users():
    try:
        if mongo_collection is None:
            return jsonify({"error": "MongoDB not configured", "db": MONGO_DB_NAME, "collection": MONGO_COLLECTION}), 500
        mongo_client.admin.command('ping')
        users = []
        cursor = mongo_collection.find({}, {"name": 1, "email": 1, "phone": 1, "department": 1, "year": 1, "rollNumber": 1}).limit(500)
        for doc in cursor:
            users.append({
                "id": str(doc.get("_id")),
                "name": doc.get("name"),
                "email": doc.get("email"),
                "phone": doc.get("phone"),
                "department": doc.get("department"),
                "year": doc.get("year"),
                "rollNumber": doc.get("rollNumber"),
            })
        return jsonify({"users": users, "total": len(users), "db": MONGO_DB_NAME, "collection": MONGO_COLLECTION})
    except Exception as e:
        return jsonify({"error": str(e), "db": MONGO_DB_NAME, "collection": MONGO_COLLECTION}), 500

@app.route('/mongo/health', methods=['GET'])
def mongo_health():
    try:
        if mongo_client is None:
            return jsonify({"connected": False, "error": "client_not_initialized", "db": MONGO_DB_NAME, "collection": MONGO_COLLECTION}), 500
        mongo_client.admin.command('ping')
        counts = None
        try:
            counts = mongo_collection.count_documents({}) if mongo_collection is not None else None
        except Exception:
            counts = None
        return jsonify({"connected": True, "db": MONGO_DB_NAME, "collection": MONGO_COLLECTION, "count": counts})
    except Exception as e:
        return jsonify({"connected": False, "error": str(e), "db": MONGO_DB_NAME, "collection": MONGO_COLLECTION}), 500

@app.route('/generate-issue-email', methods=['POST'])
def generate_issue_email():
    try:
        if mongo_collection is None:
            return jsonify({"error": "MongoDB not configured"}), 500

        data = request.get_json()
        user_id = data.get('user_id')
        event_name = data.get('event_name', 'OG Techminds Event')
        issuer_name = data.get('issuer', 'OG Techminds')
        cert_type = data.get('type', 'Participation')
        prize = data.get('prize', '')
        placement = data.get('placement', '')
        if not user_id:
            return jsonify({"error": "Missing user_id"}), 400

        user_doc = mongo_collection.find_one({"_id": ObjectId(user_id)}) if ObjectId else None
        if not user_doc:
            return jsonify({"error": "User not found"}), 404

        recipient = user_doc.get('name') or 'Participant'
        recipient_email = user_doc.get('email')

        next_id = 0
        try:
            cert_counter = asyncio.run(aptos_client.get_certificate_counter())
            if cert_counter and "data" in cert_counter:
                next_id = int(cert_counter["data"].get("count", 0))
        except Exception as e:
            logger.error(f"Failed to fetch certificate counter: {e}")

        verify_url = f"{BACKEND_BASE_URL}/verify/{next_id}"
        user_payload = {
            "name": user_doc.get('name', ''),
            "email": user_doc.get('email', ''),
            "phone": user_doc.get('phone', ''),
            "department": user_doc.get('department', ''),
            "year": user_doc.get('year', ''),
            "rollNumber": user_doc.get('rollNumber', ''),
            "avatar": user_doc.get('avatar') or user_doc.get('avatarUrl')
        }
        pdf_bytes = _generate_certificate_pdf(
            user=user_payload,
            event_name=event_name,
            issuer_name=issuer_name,
            verify_url=verify_url,
            cert_id=next_id,
            cert_type=cert_type,
            prize=prize,
            placement=placement,
        )
        pdf_hash_hex = '0x' + hashlib.sha256(pdf_bytes).hexdigest()

        blockchain_status = asyncio.run(aptos_client.issue_certificate(recipient, issuer_name, pdf_hash_hex))
        if blockchain_status.startswith("failed:") or blockchain_status.startswith("skipped:"):
            logger.error(f"Blockchain transaction failed: {blockchain_status}")
            return jsonify({
                "error": "Blockchain transaction failed",
                "details": blockchain_status
            }), 500

        time.sleep(3)
        new_cert_id = next_id
        cert_collection = asyncio.run(aptos_client.get_certificate_collection())
        new_cert = None
        if cert_collection and "data" in cert_collection:
            certificates = cert_collection["data"].get("certificates", [])
            for cert in certificates:
                if (cert.get("recipient") == recipient and 
                    cert.get("issuer") == issuer_name and 
                    cert.get("pdf_hash") == pdf_hash_hex):
                    new_cert = cert
                    new_cert_id = int(cert.get('id', next_id))
                    break

        cloudinary_url = None
        if cloudinary is not None and CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET:
            try:
                public_id = f"ogtechminds/cert_{new_cert_id}_{recipient.replace(' ','_')}"
                upload_res = cloudinary.uploader.upload(BytesIO(pdf_bytes), resource_type='raw', public_id=public_id)
                cloudinary_url = upload_res.get('secure_url')
            except Exception as e:
                logger.error(f"Cloudinary upload failed: {e}")

        try:
            if mongo_db is not None:
                extra_col = mongo_db.get_collection('certificates')
                token = str(uuid.uuid4())
                extra_col.update_one(
                    {"cert_id": int(new_cert_id)},
                    {"$set": {
                        "cert_id": int(new_cert_id),
                        "recipient": recipient,
                        "email": recipient_email,
                        "rollNumber": user_payload.get('rollNumber'),
                        "department": user_payload.get('department'),
                        "issuer": issuer_name,
                        "event_name": event_name,
                        "type": cert_type,
                        "prize": prize,
                        "placement": placement,
                        "pdf_hash": pdf_hash_hex,
                        "verify_url": verify_url,
                        "cloudinary_url": cloudinary_url,
                        "token": token,
                        "created_at": datetime.utcnow().isoformat()
                    }},
                    upsert=True
                )
        except Exception as e:
            logger.error(f"Failed to store certificate metadata: {e}")

        email_status = None
        if recipient_email and SMTP_HOST and SMTP_USER and SMTP_PASS and SMTP_FROM:
            try:
                _email_certificate(recipient_email, recipient, pdf_bytes, new_cert_id, filename=f"certificate_{recipient.replace(' ', '_')}.pdf")
                email_status = "sent"
            except Exception as e:
                email_status = f"failed: {e}"
        elif recipient_email and not (SMTP_HOST and SMTP_USER and SMTP_PASS and SMTP_FROM):
            email_status = "skipped: smtp_not_configured"

        return jsonify({
            "message": "Certificate generated, issued on-chain, and email processed",
            "certificate": {
                "id": new_cert_id,
                "recipient": recipient,
                "issuer": issuer_name,
                "pdf_hash": pdf_hash_hex,
                "verify_url": verify_url,
                "cloudinary_url": cloudinary_url
            },
            "email": email_status or "no-email",
            "blockchain_status": blockchain_status
        })

    except Exception as e:
        logger.error(f"Error in /generate-issue-email: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate-hash', methods=['POST'])
def generate_pdf_hash():
    try:
        data = request.get_json()
        filename = data.get('filename', 'document.pdf')
        mock_hash = hashlib.sha256(f"{filename}_{datetime.now().timestamp()}".encode()).hexdigest()
        return jsonify({
            "filename": filename,
            "hash": f"0x{mock_hash[:24]}",
            "note": "This is a mock hash. Real implementation would hash actual PDF content."
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/certificate-pdf/<int:cert_id>', methods=['GET'])
def get_certificate_pdf(cert_id: int):
    try:
        cert_collection = asyncio.run(aptos_client.get_certificate_collection())
        target = None
        if cert_collection and "data" in cert_collection:
            for cert in cert_collection["data"].get("certificates", []):
                if int(cert.get('id', -1)) == int(cert_id):
                    target = cert
                    break
        if not target:
            return jsonify({"error": "Certificate not found on chain"}), 404

        recipient = target.get('recipient', 'Participant')
        issuer_name = target.get('issuer', 'OG Techminds')
        verify_url = f"{BACKEND_BASE_URL}/verify/{cert_id}"
        user_payload = {"name": recipient, "email": "", "phone": "", "department": "", "year": "", "rollNumber": "", "avatar": None}
        try:
            if mongo_db is not None:
                extra_col = mongo_db.get_collection('certificates')
                doc = extra_col.find_one({"cert_id": int(cert_id)})
                if doc:
                    user_payload.update({
                        "email": doc.get('email', ''),
                        "rollNumber": doc.get('rollNumber', ''),
                        "department": doc.get('department', ''),
                    })
        except Exception:
            pass

        pdf_bytes = _generate_certificate_pdf(user_payload, event_name='OG Techminds Event', issuer_name=issuer_name, verify_url=verify_url, cert_id=cert_id)
        resp = make_response(pdf_bytes)
        resp.headers['Content-Type'] = 'application/pdf'
        resp.headers['Content-Disposition'] = f'attachment; filename="certificate_{cert_id}.pdf"'
        return resp
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    logger.info("🚀 Starting Certificate Verifier API...")
    logger.info(f"📍 Module Address: {ACCOUNT_ADDRESS}")
    logger.info("🔍 Testing network connections...")
    asyncio.run(aptos_client.test_network_connection())
    logger.info("✅ API is running")
    app.run(debug=True, host='0.0.0.0', port=int(os.getenv("PORT", 10000)))
