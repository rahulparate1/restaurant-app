// import Tesseract from 'tesseract.js';
// import { extractBillDetails } from '../providers/ai.service';

// async function detectText(imagePath:any) {
//   try {
//     const { data: { text } } = await Tesseract.recognize(
//       imagePath,
//       'eng'
//     );
//     return text;
//   } catch (error) {
//     console.error('Error:', error);
//     throw error;
//   }
// }

// // Main function to process the image and extract JSON
// export async function processImage(imagePath: any) {
//   try {
//     const text = await detectText(imagePath);
//     const jsonResult = await extractBillDetails(text);
//   } catch (error) {
//     console.error('Error processing image:', error);
//   }
// }
