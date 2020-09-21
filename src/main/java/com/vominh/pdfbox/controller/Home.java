package com.vominh.pdfbox.controller;

import com.vominh.pdfbox.Util.PdfUtils;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.io.File;
import java.io.IOException;

@Controller
public class Home {

    @GetMapping("/")
    public String index(Model model) {
        File pdfFile = null;
        File pdfFile2 = null;
        try {
            pdfFile = new ClassPathResource("pdf-template/speichersystem_ns_stand.pdf").getFile();
            pdfFile2 = new ClassPathResource("pdf-template/GAON.pdf").getFile();


            if (pdfFile2 != null) {
                var pdfUtils = new PdfUtils();
                model.addAttribute("info", pdfUtils.getInfo(pdfFile2));
                model.addAttribute("fields", pdfUtils.getFormInfo(pdfFile2));
            }
        } catch (IOException e) {
            e.printStackTrace();
        }


        return "index";
    }
}
