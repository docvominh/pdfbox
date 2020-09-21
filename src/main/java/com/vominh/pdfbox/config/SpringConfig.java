package com.vominh.pdfbox.config;

import lombok.Data;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.datetime.standard.DateTimeFormatterRegistrar;
import org.springframework.format.support.DefaultFormattingConversionService;
import org.springframework.format.support.FormattingConversionService;

import java.time.format.DateTimeFormatter;


@Configuration
@Data
public class SpringConfig {

    public static String protectPassword;

//    @Bean
//    public LocaleResolver localeResolver() {
//        SessionLocaleResolver sessionLocaleResolver = new SessionLocaleResolver();
//        sessionLocaleResolver.setDefaultLocale(new Locale("vi", "VN"));
//        return sessionLocaleResolver;
//    }

    @Bean
    public FormattingConversionService conversionService() {
        DefaultFormattingConversionService conversionService = new DefaultFormattingConversionService(false);

        DateTimeFormatterRegistrar registrar = new DateTimeFormatterRegistrar();
        registrar.setDateFormatter(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        registrar.setDateTimeFormatter(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
        registrar.registerFormatters(conversionService);

        // other desired formatters

        return conversionService;
    }

//    @Bean
//    public Jackson2ObjectMapperBuilder objectMapperBuilder() {
//        Jackson2ObjectMapperBuilder builder = new Jackson2ObjectMapperBuilder();
//        builder.serializationInclusion(JsonInclude.Include.NON_NULL);
//        builder.featuresToEnable(DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT);
//        return builder;
//    }

//    @Autowired
//    public void configureObjectMapper(final ObjectMapper mapper) {
//        mapper.registerModule(new JsonNullableModule());
//    }
}
