package com.vominh.pdfbox.Util;

import com.vominh.pdfbox.model.FieldModel;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDDocumentCatalog;
import org.apache.pdfbox.pdmodel.PDDocumentInformation;
import org.apache.pdfbox.pdmodel.interactive.form.PDAcroForm;
import org.apache.pdfbox.pdmodel.interactive.form.PDComboBox;
import org.apache.pdfbox.pdmodel.interactive.form.PDTextField;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class PdfUtils {

    private static final Logger log = LoggerFactory.getLogger(PdfUtils.class);

    public PDDocumentInformation getInfo(File file) throws IOException {
        PDDocument document = PDDocument.load(file);
        PDDocumentInformation information;
        information = document.getDocumentInformation();
        document.close();
        return information;
    }

    public List<FieldModel> getFormInfo(File file) throws IOException {
        List<FieldModel> fieldModels = new ArrayList<>();
        PDDocument document = PDDocument.load(file);
        PDDocumentCatalog docCatalog = document.getDocumentCatalog();
        PDAcroForm acroForm = docCatalog.getAcroForm();
        var fields = acroForm.getFields();

        for (var field : fields) {
            if (field instanceof PDComboBox) {
                PDComboBox comboBox = (PDComboBox) field;
                fieldModels.add(new FieldModel(comboBox.getPartialName(), "PDComboBox", comboBox.getValueAsString()));
            }

            if (field instanceof PDTextField) {
                PDTextField textField = (PDTextField) field;
                fieldModels.add(new FieldModel(textField.getPartialName(), "PDTextField", textField.getValue()));
            }

        }

        document.close();

        return fieldModels;
    }
}
